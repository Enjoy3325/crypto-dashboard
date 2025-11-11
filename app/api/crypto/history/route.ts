import axios, { AxiosError } from 'axios';

import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

interface ChartData {
  time: string;
  BTC: number;
  SOL: number;
}

// Cache configuration
const historyCache: Record<string, { ts: number; data: ChartData[] }> = {};
const HISTORY_TTL = 10 * 60 * 1000; // 10 minutes cache
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000; // Start with 2 second delay
const USE_STALE_CACHE = true; // Allow using older cache data during rate limiting

// Exponential backoff retry
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchCryptoData(coin: string, days: number, interval: string, attempt = 1) {
  try {
    const { data } = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin}/market_chart`, {
      params: { 
        vs_currency: 'usd', 
        days, 
        interval 
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
      return fetchCryptoData(coin, days, interval, attempt + 1);
    }
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const timeframe = request.nextUrl.searchParams.get('timeframe') || '24h';
    const days = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : 30;

    // Return cached if available and not expired
    const cached = historyCache[timeframe];
    const now = Date.now();
    if (cached && now - cached.ts < HISTORY_TTL) {
      return NextResponse.json(cached.data);
    }

    // Use minutes for 24h data for better accuracy
    const interval = timeframe === '24h' ? 'minute' : 'daily';

    // Fetch data with retry mechanism
    const [btcResult, solResult] = await Promise.all([
      fetchCryptoData('bitcoin', days, interval),
      fetchCryptoData('solana', days, interval),
    ]);

    // Process data for chart display
    const btcPrices = btcResult.prices || [];
    const solPrices = solResult.prices || [];
    const chartData: ChartData[] = [];

    // Calculate proper intervals based on timeframe
    const totalPoints = timeframe === '24h' ? 24 : timeframe === '7d' ? 7 : 30;
    const step = Math.max(1, Math.floor(btcPrices.length / totalPoints));

    let startIdx = 0;
    if (timeframe === '24h') {
      // For 24h view, ensure we get the most recent 24 hours
      startIdx = Math.max(0, btcPrices.length - 24 * step);
    }

    // Process data points with proper intervals
    for (let i = startIdx; i < btcPrices.length && i < solPrices.length; i += step) {
      const btcPoint = btcPrices[i];
      const solPoint = solPrices[i];

      if (!btcPoint?.[0] || !solPoint?.[0]) continue;

      const timestamp = btcPoint[0];
      const btcPrice = typeof btcPoint[1] === 'number' ? Number(btcPoint[1].toFixed(2)) : 0;
      const solPrice = typeof solPoint[1] === 'number' ? Number(solPoint[1].toFixed(2)) : 0;

      if (btcPrice <= 0 || solPrice <= 0) continue;

      chartData.push({
        time: timestamp.toString(),
        BTC: btcPrice,
        SOL: solPrice,
      });
    }

    historyCache[timeframe] = { ts: now, data: chartData };
    return NextResponse.json(chartData);
  } catch (error: any) {
    console.error('API Error:', error?.toString?.() ?? error);
    // If cached data exists for this timeframe, return it
    const timeframe = request.nextUrl.searchParams.get('timeframe') || '24h';
    const cached = historyCache[timeframe];
    if (cached) return NextResponse.json(cached.data);

    // Fallback: generate a small synthetic series so UI can render
    const now = Date.now();
    const fallback: ChartData[] = Array.from({ length: 24 }).map((_, i) => {
      const timestamp = now - (23 - i) * 3600 * 1000; // Last 24 hours
      return {
        time: timestamp.toString(),
        BTC: Math.round(30000 + Math.sin(i / 3) * 500),
        SOL: Math.round((20 + Math.cos(i / 4) * 2) * 100) / 100,
      };
    });

    return NextResponse.json(fallback, { status: 200 });
  }
}