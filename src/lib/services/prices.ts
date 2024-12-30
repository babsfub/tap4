// src/lib/services/prices.ts
import type { PriceData } from '$lib/types.js';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CoinGeckoResponse {
  [key: string]: {
    usd: number;
  };
}

interface CachedPrice extends PriceData {
  timestamp: number;
}

class PriceService {
  private cache: Map<string, CachedPrice> = new Map();

  private isCacheValid(cachedData: CachedPrice): boolean {
    return Date.now() - cachedData.timestamp < CACHE_DURATION;
  }

  async getPrice(symbol: string): Promise<PriceData | null> {
    try {
      const upperSymbol = symbol.toUpperCase();
      const cachedPrice = this.cache.get(upperSymbol);

      // Retourner le prix du cache s'il est valide
      if (cachedPrice && this.isCacheValid(cachedPrice)) {
        return {
          usd: cachedPrice.usd,
          lastUpdate: cachedPrice.lastUpdate
        };
      }

      // Fetch nouveau prix
      const response = await fetch(`${COINGECKO_API_URL}?ids=${symbol.toLowerCase()}&vs_currencies=usd`);
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data: CoinGeckoResponse = await response.json();
      const price = data[symbol.toLowerCase()]?.usd;

      if (!price) {
        return null;
      }

      const now = Date.now();
      const priceData: CachedPrice = {
        usd: price,
        lastUpdate: now,
        timestamp: now
      };

      // Mettre en cache
      this.cache.set(upperSymbol, priceData);

      return {
        usd: price,
        lastUpdate: now
      };
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      
      // Retourner le prix du cache même s'il est expiré en cas d'erreur
      const cachedPrice = this.cache.get(symbol.toUpperCase());
      if (cachedPrice) {
        return {
          usd: cachedPrice.usd,
          lastUpdate: cachedPrice.lastUpdate
        };
      }
      
      return null;
    }
  }

  // Méthode pour nettoyer le cache expiré
  cleanCache(): void {
    for (const [symbol, data] of this.cache.entries()) {
      if (!this.isCacheValid(data)) {
        this.cache.delete(symbol);
      }
    }
  }
}

// Export une instance singleton
export const priceService = new PriceService();

// Nettoyer le cache périodiquement
if (typeof setInterval !== 'undefined') {
  setInterval(() => priceService.cleanCache(), CACHE_DURATION);
}