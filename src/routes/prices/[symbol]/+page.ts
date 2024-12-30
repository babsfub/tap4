// src/routes/price/[symbol]/+page.ts
import { error } from '@sveltejs/kit';
import type { LoadEvent } from '@sveltejs/kit';

export const load = async ({ params, fetch }: LoadEvent) => {
  const response = await fetch(`/api/prices/${params.symbol}`);
  const data = await response.json();

  if (!response.ok) {
    error(response.status, data.error || 'Failed to load price');
  }

  return { price: data };
};