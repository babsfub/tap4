
<script lang="ts">
  import { walletService } from '$lib/services/wallet.js';
  import { isAddress, type Address } from 'viem';
  import PinModal from './modals/PinModal.svelte';

  let props = $props<{
    address: Address;
    balance: string;
    encryptedKey: string;
    onClose: () => void;
    isDarkMode?: boolean;
  }>();

  let recipientAddress = $state('');
  let amount = $state('');
  let error = $state<string | null>(null);
  let showPin = $state(false);
  let isLoading = $state(false);

  // Validation
  let isValidAddress = $derived(() => {
    if (!recipientAddress) return false;
    return isAddress(recipientAddress as Address);
  });

  let isValidAmount = $derived(() => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num <= parseFloat(props.balance);
  });

  let canSubmit = $derived(() => 
    isValidAddress() && isValidAmount() && !isLoading
  );

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!canSubmit) return;
    showPin = true;
  }

  async function handlePinSubmit(pin: string) {
    try {
      isLoading = true;
      error = null;
      
      const hash = await walletService.sendTransaction(
        props.encryptedKey,
        pin,
        recipientAddress as Address,
        amount
      );

      if (hash) {
        props.onClose();
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Payment failed';
      showPin = false;
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 
            backdrop-blur-sm z-50">
  <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold dark:text-white">Send MATIC</h2>
      <button 
        class="text-gray-500 hover:text-gray-700 dark:text-gray-400 
               dark:hover:text-gray-300"
        onclick={props.onClose}
      >
        <span class="material-icons">close</span>
      </button>
    </div>

    {#if error}
      <div class="bg-red-100 dark:bg-red-900/50 border border-red-400 
                  dark:border-red-800 text-red-700 dark:text-red-100 
                  px-4 py-3 rounded mb-4">
        {error}
      </div>
    {/if}

    <form onsubmit={handleSubmit} class="space-y-4">
      <!-- Champs de saisie -->
      <div>
        <label class="form-label" for="recipient">
          Recipient Address
        </label>
        <input
          id="recipient"
          type="text"
          bind:value={recipientAddress}
          placeholder="0x..."
          class="form-input"
          class:error={recipientAddress && !isValidAddress}
          disabled={isLoading}
        />
        {#if recipientAddress && !isValidAddress}
          <p class="form-error">Invalid address format</p>
        {/if}
      </div>

      <div>
        <label class="form-label" for="amount">
          Amount (MATIC)
        </label>
        <input
          id="amount"
          type="number"
          bind:value={amount}
          step="0.000001"
          min="0"
          max={props.balance}
          placeholder="0.0"
          class="form-input"
          class:error={amount && !isValidAmount}
          disabled={isLoading}
        />
        {#if amount && !isValidAmount}
          <p class="form-error">
            {#if parseFloat(amount) > parseFloat(props.balance)}
              Insufficient balance
            {:else}
              Invalid amount
            {/if}
          </p>
        {/if}
      </div>

      <div class="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          class="btn btn-secondary"
          onclick={props.onClose}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          disabled={!canSubmit}
        >
          {isLoading ? 'Processing...' : 'Continue'}
        </button>
      </div>
    </form>

    <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
      Available balance: {props.balance} MATIC
    </p>
  </div>
</div>

{#if showPin}
  <PinModal
    onSubmit={handlePinSubmit}
    onClose={() => showPin = false}
    remainingAttempts={3}
  />
{/if}

<style lang="postcss">
 
  /* Boutons déjà définis dans app.css */
</style>