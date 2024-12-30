<!-- src/routes/price/[symbol]/+page.svelte -->
<script lang="ts">
    let { data } = $props<{
      data: {
        price: {
          usd: number;
          lastUpdate: number;
        }
      }
    }>();
  </script>
  
  <div class="p-4">
    <h2 class="text-xl font-bold">
      Price: ${data.price.usd.toFixed(2)}
    </h2>
    <p class="text-sm text-gray-500">
      Last updated: {new Date(data.price.lastUpdate).toLocaleString()}
    </p>
  </div>