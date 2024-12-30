<script lang="ts">
  let props = $props<{
    formattedId: string;
    balance: string;
    address: string;
    isDarkMode: boolean;
  }>();
</script>

<div class="p-6 border-b dark:border-gray-700">
  <div class="flex justify-between items-start">
    <div>
      <h2 class="text-2xl font-bold dark:text-white">
        Card #{props.formattedId}
      </h2>
      <p class="text-sm font-mono mt-2 text-gray-600 dark:text-gray-400 
                select-all cursor-pointer">
        {props.address}
      </p>
    </div>
    <div class="text-right">
      <p class="text-xl font-bold dark:text-white">
        {props.balance} MATIC
      </p>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Balance
      </p>
    </div>
  </div>
</div>

<style lang="postcss">
  .select-all {
    @apply hover:bg-gray-100 dark:hover:bg-gray-700
           py-1 px-2 rounded transition-colors duration-200;
  }
</style>
