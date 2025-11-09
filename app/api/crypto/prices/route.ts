import axios, { AxiosError } from 'axios'

import { NextResponse } from 'next/server'

interface PriceData {
	bitcoin: {
		usd: number
		usd_24h_change: number
		usd_market_cap: number
	}
	solana: {
		usd: number
		usd_24h_change: number
		usd_market_cap: number
	}
}

interface CacheData {
	ts: number
	data: PriceData
}

let pricesCache: CacheData | null = null
const PRICES_TTL = 5 * 60 * 1000 // 5 minutes
const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 2000

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function fetchWithRetry(attempt = 1): Promise<PriceData> {
	try {
		const { data } = await axios.get(
			'https://api.coingecko.com/api/v3/simple/price',
			{
				params: {
					ids: 'bitcoin,solana',
					vs_currencies: 'usd',
					include_24hr_change: true,
					include_market_cap: true,
				},
				timeout: 15000,
				headers: {
					Accept: 'application/json',
					'User-Agent': 'CryptoHub Dashboard',
				},
			}
		)

		return data
	} catch (error) {
		if (
			error instanceof AxiosError &&
			error.response?.status === 429 &&
			attempt < MAX_RETRIES
		) {
			const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1)
			console.warn(`⚠️ Rate limited. Retry ${attempt} after ${delay}ms`)
			await sleep(delay)
			return fetchWithRetry(attempt + 1)
		}
		throw error
	}
}

export async function GET() {
	try {
		const now = Date.now()

		if (pricesCache && now - pricesCache.ts < PRICES_TTL) {
			return NextResponse.json(pricesCache.data)
		}

		const data = await fetchWithRetry()

		if (!data || !data.bitcoin || !data.solana) {
			throw new Error('Invalid data received from CoinGecko')
		}

		const payload: PriceData = {
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
		}

		pricesCache = { ts: now, data: payload }

		return NextResponse.json(payload, {
			headers: {
				'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
			},
		})
	} catch (error: any) {
		console.error('❌ Prices API Error:', error?.message ?? error)

		if (pricesCache) {
			console.warn('⚠️ Returning cached data due to error')
			return NextResponse.json(pricesCache.data)
		}

		const fallbackData: PriceData = {
			bitcoin: {
				usd: 104397,
				usd_24h_change: 2.32,
				usd_market_cap: 2082000000000,
			},
			solana: {
				usd: 165.16,
				usd_24h_change: 4.71,
				usd_market_cap: 91600000000,
			},
		}

		pricesCache = { ts: Date.now(), data: fallbackData }

		return NextResponse.json(fallbackData, {
			status: 200,
			headers: { 'X-Fallback': 'true' },
		})
	}
}
