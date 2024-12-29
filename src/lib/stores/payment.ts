// lib/stores/payment.ts
import { writable, get } from 'svelte/store'
import type { Hash, Address } from 'viem'
import { walletService } from '$lib/services/wallet.js'
import { cardStore } from './card.js'

interface NFCTransaction {
  to: Address
  from: Address
  amount: string
  timestamp: number
  hash?: Hash
  status: 'pending' | 'completed' | 'failed'
}

function createPaymentStore() {
  const transaction = writable<NFCTransaction | null>(null)
  const history = writable<NFCTransaction[]>([])
  const error = writable<string | null>(null)
  const isPending = writable(false)

  function reset() {
    transaction.set(null)
    error.set(null)
    isPending.set(false)
  }

  async function sendTransaction(to: Address, amount: string, pin: string) {
    const cardState = get(cardStore)
    
    if (!cardState.address || !cardState.encryptedKey) {
      error.set('Card not properly loaded')
      return null
    }

    try {
      isPending.set(true)
      error.set(null)

      const newTx: NFCTransaction = {
        to,
        from: cardState.address,
        amount,
        timestamp: Date.now(),
        status: 'pending'
      }
      
      transaction.set(newTx)

      const hash = await walletService.sendTransaction(
        cardState.encryptedKey,
        pin,
        to,
        amount
      )

      if (!hash) throw new Error('Transaction failed - No hash received')

      const completedTx = { ...newTx, hash, status: 'completed' as const }
      transaction.set(completedTx)

      history.update(h => [completedTx, ...h].slice(0, 50))
      await cardStore.refreshBalance()

      return hash

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Transaction failed'
      error.set(errorMsg)
      
      transaction.update(tx => tx ? { ...tx, status: 'failed' } : null)
      return null
      
    } finally {
      isPending.set(false)
    }
  }

  return {
    transaction: { subscribe: transaction.subscribe },
    history: { subscribe: history.subscribe },
    error: { subscribe: error.subscribe },
    isPending: { subscribe: isPending.subscribe },
    sendTransaction,
    reset
  }
}

export const paymentStore = createPaymentStore()