// src/routes/api/wallet/+server.ts
import { json } from '@sveltejs/kit';
import type { ApiHandler } from '$lib/types.js';
import { walletService } from '$lib/services/wallet.js';

export const POST: ApiHandler = async ({ request }) => {
  const body = await request.json();
  
  try {
    const result = await walletService.sendTransaction(
      body.encryptedKey,
      body.pin,
      body.to,
      body.amount
    );

    return json({ success: true, hash: result });
  } catch (error) {
    return json(
      { success: false, error: error instanceof Error ? error.message : 'Transaction failed' },
      { status: 400 }
    );
  }
};