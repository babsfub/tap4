// lib/stores/nfcCard.ts
import { writable, derived, get } from 'svelte/store'
import type { Address, Hash } from 'viem'
import { walletService } from '$lib/services/wallet.js'
import { cryptoService } from '$lib/services/crypto.js'

export interface NFCCardState {
  id: string
  address: Address | undefined
  encryptedKey: string | undefined
  balance: string
  isLocked: boolean
  error: string | null
  lastTransaction: Hash | null
}

export interface CardCreationResult {
  id: string
  address: Address
  pin: string
}

function createNFCCardStore() {
  const store = writable<NFCCardState>({
    id: '',
    address: undefined,
    encryptedKey: undefined,
    balance: '0',
    isLocked: true,
    error: null,
    lastTransaction: null
  })

  const isLoading = writable(false)
  const pinAttempts = writable(0)
  const MAX_PIN_ATTEMPTS = 3

  // Dérivations optimisées
  const formattedAddress = derived(store, $state =>
    $state.address ? `${$state.address.slice(0, 6)}...${$state.address.slice(-4)}` : ''
  )

  const isBlocked = derived(pinAttempts, $attempts => $attempts >= MAX_PIN_ATTEMPTS)

  async function initFromHash(hash: string) {
    try {
      isLoading.set(true)
      store.update(s => ({ ...s, error: null }))

      const cardData = cryptoService.parseCardData(hash)
      if (!cardData) {
        throw new Error('Invalid card data')
      }

      const balance = await walletService.getBalance(cardData.pub)

      store.set({
        id: cardData.id.toString(),
        address: cardData.pub,
        encryptedKey: cardData.priv,
        balance,
        isLocked: true,
        error: null,
        lastTransaction: null
      })
    } catch (error) {
      store.update(s => ({
        ...s,
        error: error instanceof Error ? error.message : 'Failed to load card'
      }))
    } finally {
      isLoading.set(false)
    }
  }

  async function importWallet(address: Address, encryptedKey: string): Promise<boolean> {
    try {
      isLoading.set(true)
      store.update(s => ({ ...s, error: null }))
  
      const balance = await walletService.getBalance(address)
      const id = Date.now().toString()
  
      store.set({
        id,
        address,
        encryptedKey,
        balance,
        isLocked: true,
        error: null,
        lastTransaction: null
      })
  
      return true
    } catch (error) {
      store.update(s => ({
        ...s,
        error: error instanceof Error ? error.message : 'Failed to import wallet'
      }))
      return false
    } finally {
      isLoading.set(false)
    }
  }

  async function unlock(pin: string): Promise<boolean> {
    if (get(isBlocked)) {
      store.update(s => ({ ...s, error: 'Too many attempts. Card is blocked.' }))
      return false
    }
  
    const state = get(store)
    if (!state.encryptedKey) {
      store.update(s => ({ ...s, error: 'No card loaded' }))
      return false
    }
  
    try {  
      // On utilise cryptoService.validatePin à la place
      const isValid = cryptoService.validatePin(pin)
      
      if (!isValid) {
        pinAttempts.update(n => n + 1)
        store.update(s => ({
          ...s,
          error: `Invalid PIN. ${MAX_PIN_ATTEMPTS - get(pinAttempts)} attempts remaining.`
        }))
        return false
      }
  
      // Vérifier que la clé peut être déchiffrée
      try {
        cryptoService.decryptPrivateKey(state.encryptedKey, pin)
      } catch {
        pinAttempts.update(n => n + 1)
        store.update(s => ({
          ...s,
          error: `Invalid PIN. ${MAX_PIN_ATTEMPTS - get(pinAttempts)} attempts remaining.`
        }))
        return false
      }
  
      store.update(s => ({ ...s, isLocked: false, error: null }))
      pinAttempts.set(0)
      return true
    } catch (error) {
      store.update(s => ({ ...s, error: 'Failed to validate PIN' }))
      return false
    }
  }

  async function sendTransaction(to: Address, amount: string, pin: string): Promise<Hash | null> {
    const state = get(store)
    
    if (state.isLocked || !state.address || !state.encryptedKey) {
      store.update(s => ({ ...s, error: 'Card is locked or invalid' }))
      return null
    }

    try {
      store.update(s => ({ ...s, error: null }))
      const hash = await walletService.sendTransaction(
        state.encryptedKey!,
        pin,
        to,
        amount
      )

      await refreshBalance()
      
      store.update(s => ({ ...s, lastTransaction: hash }))
      return hash
    } catch (error) {
      store.update(s => ({
        ...s,
        error: error instanceof Error ? error.message : 'Transaction failed'
      }))
      return null
    }
  }

  async function refreshBalance() {
    const state = get(store)
    if (!state.address) return

    try {
      const balance = await walletService.getBalance(state.address)
      store.update(s => ({ ...s, balance, error: null }))
    } catch (error) {
      store.update(s => ({ ...s, error: 'Failed to refresh balance' }))
    }
  }

  function reset() {
    store.set({
      id: '',
      address: undefined,
      encryptedKey: undefined,
      balance: '0',
      isLocked: true,
      error: null,
      lastTransaction: null
    })
    pinAttempts.set(0)
  }

  // Auto refresh avec intervalle
  if (typeof window !== 'undefined') {
    const interval = setInterval(() => {
      const state = get(store)
      if (!state.isLocked && state.address) {
        refreshBalance()
      }
    }, 30000)

    // Cleanup sur unmount
    return () => clearInterval(interval)
  }

  return {
    subscribe: store.subscribe,
    initFromHash,
    importWallet,
    unlock,
    sendTransaction,
    refreshBalance,
    reset,
    isLoading: { subscribe: isLoading.subscribe },
    isBlocked: { subscribe: isBlocked.subscribe },
    formattedAddress: { subscribe: formattedAddress.subscribe }
  }
}

export const nfcCardStore = createNFCCardStore()