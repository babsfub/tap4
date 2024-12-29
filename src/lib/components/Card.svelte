// lib/components/Card.svelte
<script lang="ts">
  import { walletService } from '$lib/services/wallet.js';
  import type { Address } from 'viem';
  import CardHeader from './card/CardHeader.svelte';
  import CardActions from './card/CardActions.svelte';
  import CardQR from './card/CardQR.svelte';
  import { generateAddressQR } from '$lib/utils/qr.js';
  import { onMount } from 'svelte';
  let props = $props<{
    address: Address;
    formattedId: string;
    isDarkMode?: boolean;
  }>();

  let balance = $state<string>('0');
  let isLocked = $state(true);
  let showQR = $state(false);
  let error = $state<string | null>(null);

  // Effet pour la mise à jour du solde
 

  onMount(async () => {
    if (props.address) {
      try {
        balance = await walletService.getBalance(props.address);
      } catch (err) {
        error = 'Failed to load balance';
      }
    }
  });

  function handleCopy() {
    navigator.clipboard.writeText(props.address);
  }

  function handleExplorer() {
    window.open(`https://polygonscan.com/address/${props.address}`, '_blank');
  }

  function toggleQR() {
    showQR = !showQR;
  }
</script>

<div class="card bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
  <CardHeader 
    formattedId={props.formattedId}
    balance={balance}
    address={props.address}
    isDarkMode={props.isDarkMode ?? false}
  />

  {#if showQR}
    <CardQR 
      onClose={toggleQR}
      isDarkMode={props.isDarkMode ?? false}
    >
      {@html generateAddressQR(props.address)}
    </CardQR>
  {:else}
    <CardActions
      isLocked={isLocked}
      onCopy={handleCopy}
      onExplorer={handleExplorer} 
      onToggleQR={toggleQR}
      onUnlock={() => isLocked = !isLocked}
      isDarkMode={props.isDarkMode ?? false}
    />
  {/if}
</div>

<style lang="postcss">
  /* Styles moved to global app.css */
</style>