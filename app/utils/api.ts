const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'

export interface CoinGeckoPrice {
	bitcoin: {
		usd: number
	}
}

export const fetchBitcoinPrice = async (): Promise<number> => {
	try {
		const response = await fetch(
			`${COINGECKO_API_URL}/simple/price?ids=bitcoin&vs_currencies=usd`
		)

		if (!response.ok) {
			throw new Error('Failed to fetch price data')
		}

		const data: CoinGeckoPrice = await response.json()
		return data.bitcoin.usd
	} catch (error) {
		throw new Error('Failed to fetch Bitcoin price')
	}
}
