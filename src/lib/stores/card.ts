// lib/stores/card.ts
import { writable, derived, get } from 'svelte/store'
import type { Address, Hash } from 'viem'
import { walletService } from '$lib/services/wallet.js'
import { cryptoService } from '$lib/services/crypto.js'

export interface CardState {
  id: string
  address: Address | undefined
  encryptedKey: string | undefined
  balance: string
  isLocked: boolean
  error: string | null
  lastTransaction: Hash | null
}

function createCardStore() {
  const store = writable<CardState>({
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

  // Dérivations
  const formattedAddress = derived(store, $state =>
    $state.address ? `${$state.address.slice(0, 6)}...${$state.address.slice(-4)}` : ''
  )

  const isBlocked = derived(pinAttempts, $attempts => $attempts >= MAX_PIN_ATTEMPTS)

  async function initFromHash(hash: string) {
    try {
      isLoading.set(true)
      
      const cardData = cryptoService.parseCardData(hash)
      if (!cardData) {
        throw new Error('Invalid card data')
      }

      const balance = await walletService.getBalance(cardData.pub)

      store.update(state => ({
        ...state,
        id: cardData.id.toString(),
        address: cardData.pub,
        encryptedKey: cardData.priv,
        balance,
        isLocked: true,
        error: null
      }))

    } catch (error) {
      store.update(state => ({
        ...state,
        error: error instanceof Error ? error.message : 'Failed to load card'
      }))
    } finally {
      isLoading.set(false)
    }
  }

  async function unlock(pin: string): Promise<boolean> {
    if (get(pinAttempts) >= MAX_PIN_ATTEMPTS) {
      store.update(state => ({...state, error: 'Too many attempts. Card is blocked.'}))
      return false
    }

    const currentState = get(store)
    
    if (!currentState.encryptedKey) {
      store.update(state => ({...state, error: 'No card loaded'}))
      return false
    }

    try {
      const isValid = cryptoService.validatePin(pin)
      
      if (!isValid) {
        pinAttempts.update(n => n + 1)
        store.update(state => ({
          ...state, 
          error: `Invalid PIN. ${MAX_PIN_ATTEMPTS - get(pinAttempts) - 1} attempts remaining.`
        }))
        return false
      }

      store.update(state => ({...state, isLocked: false, error: null}))
      pinAttempts.set(0)
      return true
    } catch (error) {
      store.update(state => ({...state, error: 'Failed to validate PIN'}))
      return false
    }
  }

  async function sendTransaction(to: Address, amount: string, pin: string): Promise<Hash | null> {
    const currentState = get(store)

    if (currentState.isLocked || !currentState.address || !currentState.encryptedKey) {
      store.update(state => ({...state, error: 'Card is locked or invalid'}))
      return null
    }

    try {
      store.update(state => ({...state, error: null}))

      const hash = await walletService.sendTransaction(
        currentState.encryptedKey!,
        pin,
        to,
        amount
      )

      await refreshBalance()
      
      store.update(state => ({...state, lastTransaction: hash}))
      return hash
    } catch (error) {
      store.update(state => ({
        ...state,
        error: error instanceof Error ? error.message : 'Transaction failed'
      }))
      return null
    }
  }

  async function refreshBalance() {
    const currentState = get(store)
    if (!currentState.address) return

    try {
      const balance = await walletService.getBalance(currentState.address)
      store.update(state => ({...state, balance, error: null}))
    } catch (error) {
      store.update(state => ({...state, error: 'Failed to refresh balance'}))
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

  return {
    subscribe: store.subscribe,
    initFromHash,
    unlock,
    sendTransaction,
    refreshBalance,
    reset,
    isLoading: { subscribe: isLoading.subscribe },
    isBlocked: { subscribe: isBlocked.subscribe },
    formattedAddress: { subscribe: formattedAddress.subscribe }
  }
}

export const cardStore = createCardStore()