<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { appStore } from '$lib/stores/app.js';


  let { children } = $props();
  let theme = $derived(appStore.getState().theme);

  onMount(() => {
    if (window?.matchMedia('(prefers-color-scheme: dark)').matches) {
      appStore.toggleTheme();
    }
  });

  $effect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  });
</script>

<svelte:head>
  <title>Tap3 - Physical NFT Cards</title>
  <meta name="description" content="Physical NFT Cards on Polygon" />
  <meta 
    name="theme-color" 
    content={theme === 'dark' ? '#1F2937' : '#F9FAFB'} 
  />
  <link
    href="https://fonts.googleapis.com/icon?family=Material+Icons"
    rel="stylesheet"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<header class="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-sm">
  <nav class="container mx-auto px-4 h-16 flex items-center justify-between">
    <div class="flex items-center space-x-4">
      <img src="/logo.svg" alt="Tap3" class="h-8 w-8" />
      <span class="text-lg font-semibold dark:text-white">Tap3</span>
   
  </nav>
</header>

<div class="pt-16">
  {@render children()}
</div>