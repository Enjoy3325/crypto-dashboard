import axios, { AxiosError } from 'axios';

import { NextResponse } from 'next/server';

interface PriceData {
  bitcoin: {
    usd: number;
    usd_24h_change: number;
    usd_market_cap: number;
  };
  solana: {
    usd: number;
    usd_24h_change: number;
    usd_market_cap: number;
  };
}

interface CacheData {
  ts: number;
  data: PriceData;
}

// Cache configuration with increased TTL for rate limiting protection
let pricesCache: CacheData | null = null;
const PRICES_TTL = 5 * 60 * 1000; // 5 minute cache to handle rate limits better
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000; // Start with 2 second delay

// Exponential backoff retry
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(attempt = 1): Promise<PriceData> {
  const now = Date.now();
  
  // Always return cache if available and not too old
  if (pricesCache && now - pricesCache.ts < PRICES_TTL * 2) {
    return pricesCache.data;
  }
  try {
    const { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'bitcoin,solana',
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_market_cap: true,
      },
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CryptoHub Dashboard',
      }
    });
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 429 && attempt < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
      await sleep(delay);
      return fetchWithRetry(attempt + 1);
    }
    throw error;
  }
}

export async function GET() {
  try {
    const now = Date.now();
    
    // Повертаємо кешовані дані, якщо вони свіжі
    if (pricesCache && now - pricesCache.ts < PRICES_TTL) {
      return NextResponse.json(pricesCache.data);
    }

    // Робимо запит до CoinGecko API
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: 'bitcoin,solana',
        vs_currencies: 'usd',
        include_24hr_change: true,
        include_market_cap: true,
      },
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CryptoHub Dashboard',
      },
      retry: 3,
      retryDelay: (retryCount) => retryCount * 1000
    });

    const data = response.data;

    // Перевіряємо, чи отримали дані
    if (!data || !data.bitcoin || !data.solana) {
      throw new Error('Invalid data received from CoinGecko');
    }

    const payload = {
      bitcoin: {
        usd: data.bitcoin.usd ?? 0,
        usd_24h_change: data.bitcoin.usd_24h_change ?? 0,
        usd_market_cap: data.bitcoin.usd_market_cap ?? 0,
      },
      solana: {
        usd: data.solana.usd ?? 0,
        usd_24h_change: data.solana.usd_24h_change ?? 0,
        usd_market_cap: data.solana.usd_market_cap ?? 0,
      },
    };

    // Кешуємо отримані дані
    pricesCache = { ts: now, data: payload };
    
    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      }
    });
    
  } catch (error: any) {
    console.error('❌ Prices API Error:', error?.message ?? error);
    
    // Якщо є кеш - повертаємо його навіть якщо він застарів
    if (pricesCache) {
      console.log('⚠️ Повертаємо застарілі кешовані дані');
      return NextResponse.json(pricesCache.data);
    }

    // Fallback дані для тестування UI
    const fallbackData = {
      bitcoin: { 
        usd: 104397, 
        usd_24h_change: 2.32, 
        usd_market_cap: 2082000000000 
      },
      solana: { 
        usd: 165.16, 
        usd_24h_change: 4.71, 
        usd_market_cap: 91600000000 
      },
    };

    console.log('⚠️ Використовуємо fallback дані');
    
    // Кешуємо fallback дані
    pricesCache = { ts: Date.now(), data: fallbackData };
    
    return NextResponse.json(fallbackData, { 
      status: 200,
      headers: {
        'X-Fallback': 'true',
      }
    });
  }
}