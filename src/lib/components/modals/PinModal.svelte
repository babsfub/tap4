// lib/components/modals/PinModal.svelte
<script lang="ts">
  import { cryptoService } from '$lib/services/crypto.js';

  let props = $props<{
    onSubmit: (pin: string) => void;
    onClose: () => void;
    maxAttempts?: number;
    remainingAttempts?: number;
  }>();

  let pin = $state('');
  let error = $state<string | null>(null);
  let isLoading = $state(false);

  let isValidPin = $derived(cryptoService.validatePin(pin));
  let attemptsDisplay = $derived(() => {
    if (props.remainingAttempts === undefined) return '';
    return `${props.remainingAttempts} attempts remaining`;
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!isValidPin || isLoading) return;
    
    isLoading = true;
    error = null;
    
    try {
      await props.onSubmit(pin);
      // Réinitialiser le PIN après la soumission réussie
      pin = '';
    } catch (err) {
      error = err instanceof Error ? err.message : 'Invalid PIN';
      // Réinitialiser le PIN en cas d'erreur aussi
      pin = '';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 
            backdrop-blur-sm z-50">
  <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold dark:text-white">Enter PIN</h2>
      <button 
        class="text-gray-500 hover:text-gray-700 dark:text-gray-400 
               dark:hover:text-gray-300 transition-colors"
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
      <div>
        <label 
          for="pin-input"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          PIN Code
        </label>
        <input
          id="pin-input"
          type="password"
          inputmode="numeric"
          pattern="\d*"
          maxlength="6"
          bind:value={pin}
          placeholder="******"
          class="input"
          class:error={pin && !isValidPin}
          autocomplete="off"
          disabled={isLoading}
        />
        {#if attemptsDisplay}
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {attemptsDisplay}
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
          disabled={!isValidPin || isLoading}
        >
          {isLoading ? 'Validating...' : 'Submit'}
        </button>
      </div>
    </form>
  </div>
</div>


<style></style>