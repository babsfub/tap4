// src/routes/api/prices/[symbol]/+server.ts
import { json } from '@sveltejs/kit';
import { priceService } from '$lib/services/prices.js';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
  if (!params.symbol) {
    return json({ error: 'Symbol is required' }, { status: 400 });
  }

  const price = await priceService.getPrice(params.symbol);

  if (!price) {
    return json({ error: 'Price not found' }, { status: 404 });
  }

  return json(price);
};