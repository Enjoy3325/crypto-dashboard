import { useEffect, useRef, useState } from 'react'

import { fetchBitcoinPrice } from '../utils/api'

export interface CryptoData {
	date: string
	price: number
}

export const useCryptoData = (limit: number = 30, interval: number = 10000) => {
	const [data, setData] = useState<CryptoData[]>([])
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

	useEffect(() => {
		const fetchData = async () => {
			try {
				const price = await fetchBitcoinPrice()
				const date = new Date().toLocaleTimeString()

				setData(prevData => {
					const newData = [...prevData, { date, price }]
					return newData.slice(-limit)
				})
				setIsLoading(false)
			} catch (err) {
				setError(
					err instanceof Error ? err.message : 'Failed to fetch price data'
				)
				setIsLoading(false)
			}
		}

		// Fetch initial data
		fetchData()

		// Set up polling interval
		intervalRef.current = setInterval(fetchData, interval)

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
			}
		}
	}, [limit, interval])

	return { data, error, isLoading }
}
