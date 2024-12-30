// src/routes/api/catalogue/[cardId]/+server.ts
import { json } from '@sveltejs/kit';
import db from '$lib/db/index.js';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
  const cardId = Number(params.cardId);
  
  if (isNaN(cardId) || cardId < 0) {
    return json({ 
      error: '404 - Not Found',
      message: 'Invalid card ID' 
    }, { status: 404 });
  }

  try {
    const query = `SELECT id_model, css, svg from catalogue WHERE id = $1`;
    const result = await db.query(query, [cardId]);
    
    if (!result.rows.length) {
      return json({ 
        error: '404 - Not Found',
        message: 'Card not found' 
      }, { status: 404 });
    }

    return json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return json({ 
      error: '500 - Internal Server Error',
      message: 'Database error'
    }, { status: 500 });
  }
};