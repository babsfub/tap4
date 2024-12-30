<script lang="ts">
  import { getHashFromUrl } from '$lib/utils/url.js';
  import Card from '$lib/components/Card.svelte';
  import Payment from '$lib/components/Payment.svelte';
  import ImportKeyModal from '$lib/components/modals/ImportKeyModal.svelte';
  import PinModal from '$lib/components/modals/PinModal.svelte';
  import { nfcCardStore } from '$lib/stores/nfc.js';
  import type { Address } from 'viem';
  import { get } from 'svelte/store';

  // États locaux avec $state de Svelte 5
  let showPayment = $state(false);
  let showImport = $state(false);
  let showPin = $state(false);
  let error = $state<string | null>(null);
  let isLoading = $state(false);
  let cardState = $state<{
    address?: Address;
    formattedId?: string;
    balance?: string;
    encryptedKey?: string;
  }>({});

  // Initialisation depuis l'URL
  $effect(() => {
    if (typeof window !== 'undefined') {
      const hash = getHashFromUrl();
      if (hash) {
        initCard(hash);
      }
    }
  });

  // Initialisation de la carte
  async function initCard(hash: string) {
    try {
      isLoading = true;
      error = null;
      if (typeof nfcCardStore !== 'function' && nfcCardStore.initFromHash) {
        await nfcCardStore.initFromHash(hash);
      }
      
      const state = typeof nfcCardStore !== 'function' ? get(nfcCardStore) : null;
      if (state) {
        cardState = {
          address: state.address,
          formattedId: state.id.padStart(4, '0'),
          balance: state.balance,
          encryptedKey: state.encryptedKey
        };
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load card';
    } finally {
      isLoading = false;
    }
  }

  // Gestion du PIN
  async function handlePinSubmit(pin: string) {
    let success = false;
    if (typeof nfcCardStore !== 'function' && nfcCardStore.unlock) {
      success = await nfcCardStore.unlock(pin);
      if (success) {
        showPin = false;
      }
    }
    if (success) {
      showPin = false;
    }
  }

  // Gestion de l'import
  async function handleImportSuccess() {
    showImport = false;
    const state = typeof nfcCardStore !== 'function' ? get(nfcCardStore) : null;
    if (state) {
      cardState = {
        address: state.address,
        formattedId: state.id.padStart(4, '0'),
        balance: state.balance,
        encryptedKey: state.encryptedKey
      };
    }
  }
</script>

<main class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
  <div class="max-w-lg mx-auto">
    {#if !cardState.address}
      <!-- Page d'accueil -->
      <div class="text-center py-12">
        <h1 class="text-4xl font-bold mb-4 dark:text-white">
          Welcome to Tap3
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mb-8">
          Scan your NFC card or import manually
        </p>
        <button
          class="btn btn-primary"
          onclick={() => showImport = true}
        >
          Import Wallet
        </button>
      </div>
    {:else}
      <!-- Contenu principal -->
      {#if isLoading}
        <div class="skeleton" role="status">
          <div class="animate-pulse space-y-4">
            <div class="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg" ></div>
          </div>
          <span class="sr-only">Loading...</span>
        </div>
      {:else if error}
        <div class="alert alert-error" role="alert">
          {error}
        </div>
      {:else}
        <Card 
          address={cardState.address}
          formattedId={cardState.formattedId ?? ''}
        />
      {/if}
    {/if}
  </div>

  <!-- Modals -->
  {#if showPayment && cardState.address && cardState.encryptedKey}
    <Payment 
      address={cardState.address}
      balance={cardState.balance ?? '0'}
      encryptedKey={cardState.encryptedKey}
      onClose={() => showPayment = false}
    />
  {/if}

  {#if showImport}
    <ImportKeyModal 
      onClose={() => showImport = false}
      onImport={handleImportSuccess}
    />
  {/if}

  {#if showPin}
    <PinModal 
      onSubmit={handlePinSubmit}
      onClose={() => showPin = false}
      remainingAttempts={3}
    />
  {/if}

  <Card 
    address={cardState.address}
    formattedId={cardState.formattedId ?? ''} />

    
</main>