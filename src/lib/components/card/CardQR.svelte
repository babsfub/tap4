
<script lang="ts">
  let props = $props<{
    onClose: () => void;
    isDarkMode: boolean;
    children?: any; // Pour le contenu SVG injecté
  }>();
</script>

<div class="p-6">
  <div class="flex justify-between items-center mb-4">
    <h3 class="text-lg font-semibold dark:text-white">
      Scan Address
    </h3>
    <button
      class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700
             transition-colors duration-200"
      onclick={props.onClose}
    >
      <span class="material-icons text-gray-600 dark:text-gray-300">
        close
      </span>
    </button>
  </div>

  <div class="flex justify-center">
    <div class="qr-container">
      <!-- Affiche le SVG du QR code -->
      {@html children}
    </div>
  </div>

  <p class="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
    Scan this QR code to get the card's address
  </p>
</div>

<style lang="postcss">
  .qr-container {
    @apply p-4 bg-white dark:bg-gray-800 rounded-lg 
           shadow-inner transition-colors duration-200
           max-w-[250px] w-full mx-auto;
  }
</style>