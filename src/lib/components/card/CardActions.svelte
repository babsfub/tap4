<script lang="ts">
  let props = $props<{
    isLocked: boolean;
    onCopy: () => void;
    onExplorer: () => void;
    onToggleQR: () => void;
    onUnlock: () => void;
    isDarkMode: boolean;
  }>();
</script>

<div class="px-6 pb-6">
  <div class="grid grid-cols-2 gap-4">
    {#if props.isLocked}
      <button
        class="card-button card-button-primary"
        onclick={props.onUnlock}
      >
        <span class="icon">lock_open</span>
        <span class="label">Unlock</span>
      </button>
    {:else}
      <button
        class="card-button card-button-primary"
        onclick={() => window.dispatchEvent(new CustomEvent('open-payment'))}
      >
        <span class="icon">send</span>
        <span class="label">Send</span>
      </button>
    {/if}

    <button
      class="card-button"
      onclick={props.onToggleQR}
    >
      <span class="icon">qr_code_2</span>
      <span class="label">QR Code</span>
    </button>

    <button class="card-button" onclick={props.onCopy}>
      <span class="icon">content_copy</span>
      <span class="label">Copy</span>
    </button>

    <button class="card-button" onclick={props.onExplorer}>
      <span class="icon">open_in_new</span>
      <span class="label">Explorer</span>
    </button>
  </div>
</div>

<style lang="postcss">
.card-button {
  @apply flex flex-col items-center justify-center p-3 rounded-lg
         transition-colors duration-200;
}

.card-button-primary {
  @apply bg-blue-500 text-white hover:bg-blue-600
         dark:bg-blue-600 dark:hover:bg-blue-700;
}

.card-button:not(.card-button-primary) {
  @apply bg-gray-100 hover:bg-gray-200
         dark:bg-gray-700 dark:hover:bg-gray-600;
}

.icon {
  @apply text-2xl;
}

.label {
  @apply mt-1 text-sm;
}
</style>