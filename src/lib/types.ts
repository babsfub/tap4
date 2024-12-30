// lib/types.ts
import type { Address, Hash } from 'viem'
import type { RequestHandler } from '@sveltejs/kit'

// Types API SvelteKit
export type ApiHandler<T = any> = RequestHandler<{}>

// Types de base
export interface CardData {
  id: string
  pub: Address
  priv?: string
  balance: string
  key?: string
  model?: number
  isUnlocked: boolean
  lastUpdate?: number
  ipfsHash?: string
}
export interface CardMetadata {
  id: string;
  model: number;
  created: number;
  address: string;
  ipfsHash?: string;
}

export interface StoredCard extends CardMetadata {
  encryptedKey?: string;
  balance: string;
  lastUpdate: number;
}

export interface Transaction {
  hash: Hash
  from: Address
  to: Address
  amount: string
  timestamp: number
  status: TransactionStatus
}

export type TransactionStatus = 'pending' | 'confirmed' | 'failed'

export interface PaymentRequest {
  to: Address
  amount: string
  from: Address
}

export interface WalletInfo {
  address: Address | undefined
  balance: string
  chainId: number
  isConnected: boolean
}

export interface CardHistory {
  transactions: Transaction[]
  lastUpdate: number
}

export interface PriceData {
  usd: number
  lastUpdate: number
}

export type CardStatus = 'locked' | 'unlocked' | 'processing'

export interface ApiError {
  code: string
  message: string
  details?: unknown
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
}

// Types pour les props des composants Svelte 5
export interface CardProps {
  onUnlock?: () => void
  onPayment?: () => void
  showQR?: boolean
  class?: string
}

export interface PaymentProps {
  onClose: () => void
  amount?: string
  recipientAddress?: Address
  class?: string
}

// Types utilitaires
export type AsyncState = 'idle' | 'loading' | 'success' | 'error'

export interface WithLoading {
  isLoading: boolean
  error: string | null
}

// Types globaux pour SvelteKit
declare global {
  namespace App {
    interface Locals {
      user?: {
        address: Address
      }
    }
    
    interface PageData {
      card?: CardData
      wallet?: WalletInfo
    }

    interface Error {
      message: string
      code?: string
    }

    interface Platform {}
  }
}

export {}