// lib/stores/app.ts
import { writable, derived, get } from 'svelte/store'
import type { Address } from 'viem'
import { browser } from '$app/environment'

interface AppState {
  networkName: string
  chainId: number
  connectedAddress: Address | undefined
  isWalletConnected: boolean
  theme: 'light' | 'dark'
}

function createAppStore() {
  const store = writable<AppState>({
    networkName: 'Polygon',
    chainId: 137,
    connectedAddress: undefined,
    isWalletConnected: false,
    theme: 'light'
  })

  if (browser) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      store.update(s => ({ ...s, theme: 'dark' }))
    }
  }

  return {
    subscribe: store.subscribe,
    
    updateWalletConnection: (address: Address | undefined, connected: boolean) => {
      store.update(s => ({
        ...s,
        connectedAddress: address,
        isWalletConnected: connected
      }))
    },

    toggleTheme: () => {
      store.update(s => ({
        ...s,
        theme: s.theme === 'light' ? 'dark' : 'light'
      }))
    },

    getState: () => get(store)
  }
}

export const appStore = createAppStore()