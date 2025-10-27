// services/priceService.ts
import axios from 'axios';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Mapeo de símbolos a IDs de CoinGecko
const COIN_IDS: Record<string, string> = {
  STX: 'blockstack',
  ETN: 'electroneum',
  sUSDC: 'usd-coin',      // Basado en USDC
  sUSDT: 'tether',        // Basado en USDT
  sBNB: 'binancecoin',    // Basado en BNB
  sETH: 'ethereum'        // Basado en ETH
};

interface TokenPrice {
  symbol: string;
  price: number;
  lastUpdated: number;
}

interface PriceCache {
  prices: Record<string, TokenPrice>;
  lastFetch: number;
}

// Cache para evitar demasiadas llamadas a la API
const priceCache: PriceCache = {
  prices: {},
  lastFetch: 0
};

const CACHE_DURATION = 60000; // 1 minuto en milisegundos

export class PriceService {
  /**
   * Obtiene los precios de todos los tokens desde CoinGecko
   */
  async getAllPrices(): Promise<Record<string, number>> {
    // Verificar si el cache es válido
    const now = Date.now();
    if (now - priceCache.lastFetch < CACHE_DURATION && Object.keys(priceCache.prices).length > 0) {
      console.log('Returning cached prices');
      return Object.fromEntries(
        Object.entries(priceCache.prices).map(([symbol, data]) => [symbol, data.price])
      );
    }

    try {
      // Lista de IDs de CoinGecko separados por coma
      const coinIds = Object.values(COIN_IDS).join(',');
      
      const response = await axios.get(`${COINGECKO_API_URL}/simple/price`, {
        params: {
          ids: coinIds,
          vs_currencies: 'usd',
          include_last_updated_at: true
        }
      });

      const data = response.data;
      const prices: Record<string, number> = {};

      // Mapear las respuestas de CoinGecko a nuestros símbolos
      for (const [symbol, coinId] of Object.entries(COIN_IDS)) {
        if (data[coinId]) {
          prices[symbol] = data[coinId].usd;
          
          // Actualizar cache
          priceCache.prices[symbol] = {
            symbol,
            price: data[coinId].usd,
            lastUpdated: data[coinId].last_updated_at || now
          };
        }
      }

      priceCache.lastFetch = now;
      
      console.log('Fetched fresh prices from CoinGecko:', prices);
      return prices;
    } catch (error) {
      console.error('Error fetching prices from CoinGecko:', error);
      
      // Si hay error, retornar cache si existe
      if (Object.keys(priceCache.prices).length > 0) {
        console.log('Returning stale cached prices due to API error');
        return Object.fromEntries(
          Object.entries(priceCache.prices).map(([symbol, data]) => [symbol, data.price])
        );
      }
      
      throw new Error('Failed to fetch prices and no cache available');
    }
  }

  /**
   * Obtiene el precio de un token específico
   */
  async getPrice(symbol: string): Promise<number> {
    const prices = await this.getAllPrices();
    
    if (!prices[symbol]) {
      throw new Error(`Price not found for token: ${symbol}`);
    }
    
    return prices[symbol];
  }

  /**
   * Calcula el exchange rate entre dos tokens
   */
  async getExchangeRate(fromToken: string, toToken: string): Promise<number> {
    const prices = await this.getAllPrices();
    
    if (!prices[fromToken] || !prices[toToken]) {
      throw new Error(`Price not found for tokens: ${fromToken} or ${toToken}`);
    }
    
    // Exchange rate = precio del token origen / precio del token destino
    return prices[fromToken] / prices[toToken];
  }

  /**
   * Calcula la cantidad esperada de un swap
   */
  async calculateSwapAmount(
    fromToken: string,
    toToken: string,
    amount: number
  ): Promise<number> {
    const rate = await this.getExchangeRate(fromToken, toToken);
    return amount * rate;
  }
}

export const priceService = new PriceService();
