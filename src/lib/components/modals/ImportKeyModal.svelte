<!-- lib/components/modals/ImportKeyModal.svelte -->
<script lang="ts">
  import { walletService } from '$lib/services/wallet.js';
  import { cryptoService } from '$lib/services/crypto.js';
  import type { Address } from 'viem';

  let props = $props<{
    onClose: () => void;
    onImport?: (address: Address) => void;
  }>();

  let privateKey = $state('');
  let pin = $state('');
  let confirmPin = $state('');
  let error = $state<string | null>(null);
  let address = $state<Address | null>(null);
  let isLoading = $state(false);
  
  let normalizedKey = $derived(() => {
    try {
      return cryptoService.normalizePrivateKey(privateKey);
    } catch {
      return privateKey;
    }
  });


  // Validation améliorée
  let isValidKey = $derived(() => 
    privateKey && cryptoService.isValidPrivateKey(privateKey)
  );
  let isValidPin = $derived(cryptoService.validatePin(pin));
  let isPinMatch = $derived(pin === confirmPin);
  let canSubmit = $derived(
    isValidKey() && isValidPin && isPinMatch && !isLoading
  );

  
  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      isLoading = true;
      error = null;

      const result = await walletService.importPrivateKey(
        normalizedKey(), 
        pin
      
      );

      address = result.address;
      
      // Notification du succès au composant parent
      if (props.onImport) {
        props.onImport(result.address);
      }
      
      // Réinitialiser les champs
      privateKey = '';
      pin = '';
      confirmPin = '';

      // Fermer après un court délai pour voir l'adresse
      setTimeout(props.onClose, 1500);

    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to import private key';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm z-50">
  <div class="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold dark:text-white">Import Private Key</h2>
      <button 
        class="text-gray-500 hover:text-gray-700 dark:text-gray-400 
               dark:hover:text-gray-300"
        onclick={props.onClose}
        aria-label="Close"
      >
        <span class="material-icons">close</span>
      </button>
    </div>

    {#if error}
      <div class="bg-red-100 dark:bg-red-900/50 border border-red-400 
                  dark:border-red-800 text-red-700 dark:text-red-100 
                  px-4 py-3 rounded mb-4"
           role="alert"
      >
        {error}
      </div>
    {/if}

    <form onsubmit={handleSubmit} class="space-y-4">
      <div>
        <label for="private-key" class="form-label">
          Private Key
          <span class="text-sm text-gray-500 dark:text-gray-400">
            (64 hex characters)
          </span>
        </label>
        <input
          id="private-key"
          type="password"
          bind:value={privateKey}
          placeholder="0x..."
          autocomplete="off"
          class="form-input"
          class:error={privateKey && !isValidKey}
          disabled={isLoading}
        />
        {#if privateKey && !isValidKey}
          <p class="form-error">Invalid private key format</p>
        {/if}
      </div>

      <div>
        <label for="pin" class="form-label">
          PIN (6 digits)
        </label>
        <input
          id="pin"
          type="password"
          inputmode="numeric"
          pattern="\d{6}"
          maxlength="6"
          bind:value={pin}
          placeholder="******"
          class="form-input text-center tracking-widest"
          class:error={pin && !isValidPin}
          disabled={isLoading}
        />
        {#if pin && !isValidPin}
          <p class="form-error">PIN must be exactly 6 digits</p>
        {/if}
      </div>

      <div>
        <label for="confirm-pin" class="form-label">
          Confirm PIN
        </label>
        <input
          id="confirm-pin"
          type="password"
          inputmode="numeric"
          pattern="\d{6}"
          maxlength="6"
          bind:value={confirmPin}
          placeholder="******"
          class="form-input text-center tracking-widest"
          class:error={confirmPin && !isPinMatch}
          disabled={isLoading}
        />
        {#if confirmPin && !isPinMatch}
          <p class="form-error">PINs do not match</p>
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
          {isLoading ? 'Importing...' : 'Import'}
        </button>
      </div>
    </form>

    {#if address}
      <div class="mt-4 p-3 bg-green-100 dark:bg-green-900/50 
                  border border-green-400 dark:border-green-800 
                  text-green-700 dark:text-green-100 rounded"
           role="status"
      >
        <p class="text-sm font-medium">Successfully imported wallet:</p>
        <p class="text-xs font-mono mt-1">{address}</p>
      </div>
    {/if}
  </div>
</div>

<style>
  /* Les styles peuvent être déplacés dans le fichier app.css */
  
  /* Utilisation des styles de boutons globaux depuis app.css */
</style>