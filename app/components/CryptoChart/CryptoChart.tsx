'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
	Area,
	AreaChart,
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { BiBitcoin } from 'react-icons/bi'
import { CustomDot } from '@/app/utils/CustomDot'
import { FramerTooltip } from '../FramerTooltip/FramerTooltip'
import { SiSolana } from 'react-icons/si'
import { SplitDot } from '@/app/utils/SplitDot'

type ChartType = 'area' | 'line' | 'split'
type ChartTimeframe = '24h' | '7d' | '30d'

interface ChartDatum {
	time: number
	BTC: number
	SOL: number
	BTCChange: number
	SOLChange: number
	timeframe?: ChartTimeframe
}

interface CryptoPrice {
	bitcoin: { usd: number; usd_24h_change: number; usd_market_cap?: number }
	solana: { usd: number; usd_24h_change: number; usd_market_cap?: number }
}

function formatXAxis(val: number, timeframe: ChartTimeframe) {
	const d = new Date(val)
	if (timeframe === '24h')
		return d.toLocaleTimeString('en-GB', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false,
		})
	return d.toLocaleDateString('en-GB', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	})
}
interface PriceTooltipProps {
	active?: boolean
	payload?: {
		value: number
		dataKey: string
		payload?: { timeframe?: ChartTimeframe }
	}[]
	label?: string | number
}
const formatPrice = (val: number, digits = 2) => {
	return val.toLocaleString('en-US', {
		minimumFractionDigits: digits,
		maximumFractionDigits: digits,
	})
}

const PriceTooltip: React.FC<PriceTooltipProps> = ({
	active,
	payload,
	label,
}) => {
	if (active && payload && payload.length) {
		return (
			<div
				className='backdrop-blur-xl bg-white/98 shadow-[0_20px_70px_rgba(0,0,0,0.5)] rounded-3xl px-9 py-8 min-w-[280px]'
				style={{
					fontFamily: 'Inter, system-ui, sans-serif',
					border: 'none',
				}}
			>
				<div className='text-lg font-extrabold mb-5 text-slate-900 tracking-tight'>
					{formatXAxis(Number(label), payload[0]?.payload?.timeframe || '7d')}
				</div>
				{payload.map((entry: any, idx: number) => (
					<div
						key={idx}
						className='flex gap-4 items-center text-lg mb-3 last:mb-0'
					>
						{entry.dataKey === 'BTC' ? (
							<BiBitcoin
								className='text-3xl flex-shrink-0'
								style={{ color: '#FFD700' }}
							/>
						) : (
							<SiSolana
								className='text-3xl flex-shrink-0'
								style={{ color: '#00ffa5' }}
							/>
						)}
						<span className='font-black text-slate-900 min-w-[48px]'>
							{entry.dataKey}
						</span>
						<span
							className='ml-auto font-mono text-xl font-extrabold text-right'
							style={{ color: entry.dataKey === 'BTC' ? '#FFD700' : '#00ffa5' }}
						>
							${entry.value != null ? formatPrice(entry.value, 4) : '-'}
						</span>
					</div>
				))}
			</div>
		)
	}

	return null
}

interface CryptoChartProps {
	data: { date: string; price: number }[]
}

export const CryptoChart: React.FC<CryptoChartProps> = ({ data }) => {
	const [now, setNow] = useState<Date | null>(null)
	const [prices, setPrices] = useState<CryptoPrice | null>(null)
	const [chartData, setChartData] = useState<ChartDatum[]>([])
	const [timeframe, setTimeframe] = useState<ChartTimeframe>('24h')
	const [chartType, setChartType] = useState<ChartType>('line')
	const [tooltipData, setTooltipData] = useState<any>(null)
	const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
		null
	)

	// Set current time on mount
	useEffect(() => {
		setNow(new Date())
	}, [])

	// Update current time every second
	useEffect(() => {
		if (!now) setNow(new Date())
		const timer = setInterval(() => setNow(new Date()), 1000)
		return () => clearInterval(timer)
	}, [now])

	// Fetch current prices on mount
	useEffect(() => {
		const fetchPrices = async () => {
			try {
				const res = await fetch('/api/crypto/prices')
				if (!res.ok) throw new Error('Error receiving prices')
				const json = await res.json()

				setPrices({
					bitcoin: {
						usd: json.bitcoin?.usd ?? 0,
						usd_24h_change: json.bitcoin?.usd_24h_change ?? 0,
						usd_market_cap: json.bitcoin?.usd_market_cap ?? 0,
					},
					solana: {
						usd: json.solana?.usd ?? 0,
						usd_24h_change: json.solana?.usd_24h_change ?? 0,
						usd_market_cap: json.solana?.usd_market_cap ?? 0,
					},
				})
			} catch (error) {
				console.error('Error loading prices:', error)
			}
		}

		fetchPrices()
	}, [])

	// Fetch historical data when timeframe changes
	useEffect(() => {
		const fetchHistory = async () => {
			try {
				const res = await fetch(`/api/crypto/history?timeframe=${timeframe}`)
				if (!res.ok) throw new Error('Error retrieving history')
				const series = await res.json()

				setChartData(
					series.map((item: any) => ({
						time: Number(item.time),
						BTC: Number(item.BTC),
						SOL: Number(item.SOL),
						timeframe,
					}))
				)
			} catch (error) {
				console.error('Error loading history:', error)
			}
		}

		fetchHistory()
	}, [timeframe])

	const handleMouseMove = useCallback((state: any) => {
		if (state?.isTooltipActive && state.activePayload?.length > 0) {
			const payload = state.activePayload[0].payload
			setTooltipData({
				time: payload.time,
				BTC: payload.BTC,
				BTCChange: payload.BTCChange,
				SOL: payload.SOL,
				SOLChange: payload.SOLChange,
			})
			setCursorPos({
				x: state.chartX ?? 0,
				y: state.chartY ?? 0,
			})
		} else {
			setTooltipData(null)
			setCursorPos(null)
		}
	}, [])

	const handleMouseLeave = useCallback(() => {
		setTooltipData(null)
	}, [])

	const handleTouchMove = handleMouseMove

	const handlePointerMove = useCallback((state: any) => {
		if (state && state.activePayload && state.activePayload.length) {
			const payload = state.activePayload[0]
			setTooltipData(payload.payload)
			setCursorPos({ x: state.chartX, y: state.chartY })
		}
	}, [])

	const btcVals = useMemo(() => chartData.map(d => d.BTC), [chartData])
	const solVals = useMemo(() => chartData.map(d => d.SOL), [chartData])
	const btcMin = Math.min(...btcVals)
	const btcMax = Math.max(...btcVals)
	const solMin = Math.min(...solVals)
	const solMax = Math.max(...solVals)

	const getChangeColor = (change: number) =>
		change > 0
			? 'text-green-400'
			: change < 0
			? 'text-red-400'
			: 'text-slate-400'

	const buttons = [
		{ label: '24H', value: '24h', color: '#FFD700' },
		{ label: '7D', value: '7d', color: '#FFD700' },
		{ label: '30D', value: '30d', color: '#FFD700' },
	]
	const chartBtns = [
		{ label: 'Area', value: 'area', color: '#00ffa5' },
		{ label: 'Line', value: 'line', color: '#00ffa5' },
		{ label: 'Split', value: 'split', color: '#00ffa5' },
	]

	let ChartBlock: React.ReactNode = null
	if (chartType === 'split') {
		ChartBlock = (
			<div className='flex flex-col md:flex-row gap-8 lg:gap-12 mt-8 mb-10'>
				<div className='flex-1 relative rounded-2xl p-6 lg:p-8 bg-gradient-to-br from-[#181d3b] to-[#181f2a]'>
					<ResponsiveContainer width='100%' height={340}>
						<LineChart
							className='glow-btc cursor-pointer'
							data={chartData}
							onMouseMove={handleMouseMove}
							onMouseLeave={handleMouseLeave}
							onTouchMove={handleTouchMove}
							onTouchEnd={handleMouseLeave}
						>
							<XAxis
								dataKey='time'
								tickFormatter={v => formatXAxis(Number(v), timeframe)}
								tick={{ fill: '#FFD700', fontSize: 16 }}
								stroke='none'
							/>
							<YAxis
								tickFormatter={v => `$${v}`}
								tick={{ fill: '#FFD700', fontSize: 16 }}
								stroke='none'
							/>
							<Tooltip cursor={false} content={<PriceTooltip />} />

							<Line
								type='monotone'
								isAnimationActive={false}
								dataKey='BTC'
								name='Bitcoin'
								stroke='#FFD700'
								strokeWidth={4}
								dot={<SplitDot dataKey='BTC' />}
								className='pointer-events-auto cursor-pointer'
							/>
						</LineChart>
						{/* {tooltipData && cursorPos && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1, x: cursorPos.x, y: cursorPos.y }}
								transition={{ type: 'spring', stiffness: 160, damping: 22 }}
								className='absolute z-1111 bg-slate-900/95 text-white px-4 py-2 rounded-xl shadow-lg pointer-events-none'
								style={{
									position: 'absolute',
									pointerEvents: 'none',
									left: cursorPos.x,
									top: cursorPos.y,
									minWidth: '140px',
									borderRadius: '12px',
									fontSize: '12px',
									whiteSpace: 'nowrap',
								}}
							>
								<div className='text-xs text-slate-400'>
									{new Date(tooltipData.time).toLocaleString()}
								</div>
								{tooltipData?.BTC != null && (
									<div className='font-bold text-yellow-400'>
										BTC: ${formatPrice(tooltipData.BTC, 2)}
									</div>
								)}

								{tooltipData?.SOL != null && (
									<div className='font-bold text-yellow-400'>
										SOL: ${formatPrice(tooltipData.SOL, 2)}
									</div>
								)}
							</motion.div>
						)} */}
					</ResponsiveContainer>
				</div>
				<div className='flex-1 relative rounded-2xl p-6 lg:p-8 bg-gradient-to-br from-[#0c4035] to-[#26473b]'>
					<ResponsiveContainer width='100%' height={540}>
						<LineChart
							className='glow-sol cursor-pointer'
							data={chartData}
							onMouseMove={handleMouseMove}
							onMouseLeave={handleMouseLeave}
							onTouchMove={handleTouchMove}
							onTouchEnd={handleMouseLeave}
						>
							<XAxis
								dataKey='time'
								tickFormatter={v => formatXAxis(Number(v), timeframe)}
								tick={{ fill: '#00ffa5', fontSize: 16 }}
								stroke='none'
							/>
							<YAxis
								tickFormatter={v => `${v}`}
								tick={{ fill: '#00ffa5', fontSize: 16 }}
								stroke='none'
							/>
							<Tooltip cursor={false} content={<PriceTooltip />} />

							<Line
								type='monotone'
								isAnimationActive={false}
								dataKey='SOL'
								name='Solana'
								stroke='#00ffa5'
								strokeWidth={4}
								dot={<SplitDot dataKey='SOL' />}
								className='pointer-events-auto cursor-pointer'
							/>
						</LineChart>
						{tooltipData && cursorPos && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1, x: cursorPos.x, y: cursorPos.y }}
								transition={{ type: 'spring', stiffness: 160, damping: 22 }}
								className='absolute z-1111 bg-slate-900/95 text-white px-4 py-2 rounded-xl shadow-lg pointer-events-none'
								style={{
									position: 'absolute',
									pointerEvents: 'none',
									left: cursorPos.x,
									top: cursorPos.y,
									minWidth: '140px',
									borderRadius: '12px',
									fontSize: '12px',
									whiteSpace: 'nowrap',
								}}
							>
								<div className='text-xs text-slate-400'>
									{new Date(tooltipData.time).toLocaleString()}
								</div>
								{tooltipData?.BTC != null && (
									<div className='font-bold text-yellow-400'>
										BTC: ${formatPrice(tooltipData.BTC, 2)}
									</div>
								)}

								{tooltipData?.SOL != null && (
									<div className='font-bold text-yellow-400'>
										SOL: ${formatPrice(tooltipData.SOL, 2)}
									</div>
								)}
							</motion.div>
						)}
					</ResponsiveContainer>
				</div>
			</div>
		)
	} else if (chartType === 'area') {
		ChartBlock = (
			<div className='relative'>
				<ResponsiveContainer width='100%' height={540}>
					<AreaChart
						data={chartData}
						margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
						onMouseLeave={handleMouseLeave}
						onMouseMove={handleMouseMove}
						onTouchEnd={handleMouseLeave}
						onTouchMove={handleMouseMove}
					>
						<defs>
							<linearGradient id='btcGradient' x1='0' y1='0' x2='0' y2='1'>
								<stop offset='5%' stopColor='#FFD700' stopOpacity={0.4} />
								<stop offset='95%' stopColor='#FFD700' stopOpacity={0} />
							</linearGradient>
							<linearGradient id='solGradient' x1='0' y1='0' x2='0' y2='1'>
								<stop offset='5%' stopColor='#00ffa5' stopOpacity={0.4} />
								<stop offset='95%' stopColor='#00ffa5' stopOpacity={0} />
							</linearGradient>
						</defs>
						/* Grid */
						<CartesianGrid strokeDasharray='13 13' stroke='#334155' />
						/* Axes */
						<XAxis
							dataKey='time'
							tickFormatter={v => formatXAxis(Number(v), timeframe)}
							tick={{ fill: '#cbd5e1', fontSize: 14 }}
							stroke='none'
						/>
						<YAxis
							yAxisId='left'
							tickFormatter={v => `${v}`}
							tick={{ fill: '#FFD700' }}
							type='number'
							domain={['auto', 'auto']}
						/>
						<YAxis
							yAxisId='right'
							orientation='right'
							tickFormatter={v => `${v}`}
							tick={{ fill: '#00ffa5' }}
							type='number'
							domain={['auto', 'auto']}
						/>
						<FramerTooltip tooltipData={tooltipData} cursorPos={cursorPos} />
						{/* Bitcoin Area */}
						<motion.g
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 1 }}
						>
							<Area
								yAxisId='left'
								type='monotone'
								dataKey='BTC'
								stroke='#FFD700'
								strokeWidth={3.5}
								fill='url(#btcGradient)'
								dot={<CustomDot dataKey='BTC' />}
								isAnimationActive={true}
								animationEasing='ease-in-out'
								name='BTC'
							/>
						</motion.g>
						{/* Solana Area */}
						<motion.g
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 1, delay: 0.2 }}
						>
							<Area
								yAxisId='right'
								type='monotone'
								dataKey='SOL'
								stroke='#00ffa5'
								strokeWidth={3.5}
								fill='url(#solGradient)'
								dot={<CustomDot dataKey='SOL' />}
								isAnimationActive={true}
								animationEasing='ease-in-out'
								name='SOL'
							/>
						</motion.g>
					</AreaChart>
					<FramerTooltip tooltipData={tooltipData} cursorPos={cursorPos} />
				</ResponsiveContainer>
			</div>
		)
	} else {
		ChartBlock = (
			<div className='relative'>
				<ResponsiveContainer width='100%' height={540}>
					<LineChart
						className='glow-btc cursor-pointer'
						data={chartData}
						onMouseMove={handleMouseMove}
						onMouseLeave={handleMouseLeave}
						onTouchMove={handleTouchMove}
						onTouchEnd={handleMouseLeave}
					>
						<XAxis
							dataKey='time'
							tickFormatter={v => formatXAxis(Number(v), timeframe)}
							tick={{ fill: '#cbd5e1', fontSize: 16 }}
							stroke='none'
						/>
						<YAxis
							yAxisId='left'
							tickFormatter={v => `${v}`}
							tick={{ fill: '#FFD700', fontSize: 16 }}
							stroke='none'
						/>
						<YAxis
							yAxisId='right'
							orientation='right'
							tickFormatter={v => `${v}`}
							tick={{ fill: '#00ffa5', fontSize: 16 }}
							stroke='none'
						/>
						<Tooltip cursor={false} content={<PriceTooltip />} />
						<Line
							className='glow-btc pointer-events-auto cursor-pointer'
							yAxisId='left'
							type='monotone'
							isAnimationActive={false}
							dataKey='BTC'
							stroke='#FFD700'
							strokeWidth={4}
							dot={<CustomDot dataKey='BTC' />}
							name='BTC'
						/>
						<Line
							yAxisId='right'
							type='monotone'
							isAnimationActive={false}
							dataKey='SOL'
							stroke='#00ffa5'
							strokeWidth={4}
							dot={<CustomDot dataKey='SOL' />}
							name='SOL'
							className='pointer-events-auto cursor-pointer glow-sol'
						/>
					</LineChart>
					{tooltipData && cursorPos && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1, x: cursorPos.x, y: cursorPos.y }}
							transition={{ type: 'spring', stiffness: 160, damping: 22 }}
							className='absolute z-1111 bg-slate-900/95 text-white px-4 py-2 rounded-xl shadow-lg pointer-events-none'
							style={{
								position: 'absolute',
								pointerEvents: 'none',
								left: cursorPos.x,
								top: cursorPos.y,
								minWidth: '140px',
								borderRadius: '12px',
								fontSize: '12px',
								whiteSpace: 'nowrap',
							}}
						>
							<div className='text-xs text-slate-400'>
								{new Date(tooltipData.time).toLocaleString()}
							</div>
							{tooltipData?.BTC != null && (
								<div className='font-bold text-yellow-400'>
									BTC: {formatPrice(tooltipData.BTC, 2)}
								</div>
							)}
							{tooltipData?.SOL != null && (
								<div className='font-bold text-yellow-400'>
									SOL: {formatPrice(tooltipData.SOL, 2)}
								</div>
							)}
						</motion.div>
					)}
				</ResponsiveContainer>
			</div>
		)
	}

	return (
		<div className='w-full max-w-[1600px] mx-auto py-6 sm:py-8 md:py-12 lg:py-16 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32'>
			{/* Header Section */}
			<div className='font-black text-center text-4xl sm:text-5xl md:text-6xl tracking-tight text-slate-100 mt-4 sm:mt-6 md:mt-8 mb-4 sm:mb-5 md:mb-6'>
				Crypto Dashboard
			</div>
			<div className='text-slate-300 text-center text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 font-semibold max-w-3xl mx-auto px-4'>
				Real-time analytics for{' '}
				<span className='text-yellow-400 font-black'>Bitcoin</span> and{' '}
				<span className='text-green-400 font-black'>Solana</span>
			</div>
			<div className='text-sm sm:text-base md:text-lg text-slate-400 text-center mb-8 sm:mb-10 md:mb-12 font-medium'>
				Live data • Multiple timeframes • Powered by CoinGecko
			</div>

			{/* Analytics Table */}
			<div className='max-w-5xl mx-auto mb-10 sm:mb-12 md:mb-16 px-4 sm:px-6'>
				<div className='bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl'>
					<h2 className='text-2xl sm:text-3xl md:text-4xl font-black text-center text-slate-100 mb-8 sm:mb-10'>
						Analytics Dashboard
					</h2>
					<div className='overflow-x-auto'>
						<table className='w-full text-base sm:text-lg'>
							<thead>
								<tr className='border-b-2 border-slate-700'>
									<th className='text-left py-4 sm:py-5 px-3 sm:px-4 font-bold text-slate-300 text-lg sm:text-xl'>
										Metric
									</th>
									<th className='text-center py-4 sm:py-5 px-3 sm:px-4 font-black text-yellow-300 text-lg sm:text-xl'>
										Bitcoin
									</th>
									<th className='text-center py-4 sm:py-5 px-3 sm:px-4 font-black text-green-300 text-lg sm:text-xl'>
										Solana
									</th>
								</tr>
							</thead>
							<tbody>
								<tr className='border-b border-slate-700/50'>
									<td className='py-4 sm:py-5 px-3 sm:px-4 font-semibold text-slate-300'>
										Current Price
									</td>
									<td className='py-4 sm:py-5 px-3 sm:px-4 text-center font-black font-mono text-yellow-100 text-xl sm:text-2xl'>
										$
										{prices?.bitcoin.usd != null
											? `${formatPrice(prices.bitcoin.usd, 4)}`
											: '-'}
									</td>
									<td className='py-4 sm:py-5 px-3 sm:px-4 text-center font-black font-mono text-green-100 text-xl sm:text-2xl'>
										$
										{prices?.solana.usd != null
											? `${formatPrice(prices.solana.usd, 4)}`
											: '-'}
									</td>
								</tr>
								<tr className='border-b border-slate-700/50'>
									<td className='py-4 sm:py-5 px-3 sm:px-4 font-semibold text-slate-300'>
										24h Change
									</td>
									<td className='py-4 sm:py-5 px-3 sm:px-4 text-center'>
										<span
											className={`font-black text-xl sm:text-2xl ${getChangeColor(
												prices?.bitcoin.usd_24h_change ?? 0
											)}`}
										>
											{prices?.bitcoin.usd_24h_change !== undefined &&
											prices.bitcoin.usd_24h_change > 0
												? '+'
												: ''}
											{prices?.bitcoin.usd_24h_change?.toFixed(2)}%
										</span>
									</td>
									<td className='py-4 sm:py-5 px-3 sm:px-4 text-center'>
										<span
											className={`font-black text-xl sm:text-2xl ${getChangeColor(
												prices?.solana.usd_24h_change ?? 0
											)}`}
										>
											{prices?.solana.usd_24h_change !== undefined &&
											prices.solana.usd_24h_change > 0
												? '+'
												: ''}
											{prices?.solana.usd_24h_change?.toFixed(2)}%
										</span>
									</td>
								</tr>
								<tr className='border-b border-slate-700/50'>
									<td className='py-4 sm:py-5 px-3 sm:px-4 font-semibold text-slate-300'>
										Market Cap
									</td>
									<td className='py-4 sm:py-5 px-3 sm:px-4 text-center font-mono text-slate-100 text-base sm:text-lg'>
										$
										{(prices?.bitcoin.usd_market_cap ?? 0).toLocaleString(
											'en-US',
											{ notation: 'compact', maximumFractionDigits: 2 }
										)}
									</td>
									<td className='py-4 sm:py-5 px-3 sm:px-4 text-center font-mono text-slate-100 text-base sm:text-lg'>
										$
										{(prices?.solana.usd_market_cap ?? 0).toLocaleString(
											'en-US',
											{ notation: 'compact', maximumFractionDigits: 2 }
										)}
									</td>
								</tr>
								<tr className='border-b border-slate-700/50'>
									<td className='py-4 sm:py-5 px-3 sm:px-4 font-semibold text-slate-300'>
										Period High
									</td>
									<td className='py-4 sm:py-5 px-3 sm:px-4 text-center font-mono text-slate-100 text-base sm:text-lg'>
										$
										{prices?.bitcoin.usd != null
											? `${formatPrice(prices.bitcoin.usd, 4)}`
											: '-'}
									</td>
									<td className='py-4 sm:py-5 px-3 sm:px-4 text-center font-mono text-slate-100 text-base sm:text-lg'>
										$
										{prices?.solana.usd != null
											? `${formatPrice(prices.solana.usd, 4)}`
											: '-'}
									</td>
								</tr>
								<tr>
									<td className='py-4 sm:py-5 px-3 sm:px-4 font-semibold text-slate-300'>
										Period Low
									</td>
									<td className='py-4 sm:py-5 px-3 sm:px-4 text-center font-mono text-slate-100 text-base sm:text-lg'>
										$
										{prices?.bitcoin.usd != null
											? `${formatPrice(prices.bitcoin.usd, 4)}`
											: '-'}
									</td>
									<td className='py-4 sm:py-5 px-3 sm:px-4 text-center font-mono text-slate-100 text-base sm:text-lg'>
										$
										{prices?.solana.usd != null
											? `${formatPrice(prices.solana.usd, 4)}`
											: '-'}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
			{/* Buttons Section */}
			<div
				className='mb-10 sm:mb-12 md:mb-14 px-2 sm:px-4 z-[999]'
				style={{ position: 'relative' }}
			>
				{/* Timeframe Buttons */}
				<div className='mb-8 sm:mb-10'>
					<h3 className='text-center text-lg sm:text-xl font-bold text-slate-300 mb-4 sm:mb-5'>
						Time Period
					</h3>
					<div className='flex flex-wrap justify-center gap-4 sm:gap-5 md:gap-6 relative'>
						{buttons.map(btn => (
							<button
								key={btn.value}
								type='button'
								tabIndex={0}
								onClick={() => setTimeframe(btn.value as ChartTimeframe)}
								style={{
									background: timeframe === btn.value ? btn.color : '#1e293b',
									color: timeframe === btn.value ? '#0f172a' : '#cbd5e1',
									boxShadow:
										timeframe === btn.value
											? `0 0 20px ${btn.color}dd, 0 4px 12px rgba(0,0,0,0.3)`
											: '0 2px 8px rgba(0,0,0,0.2)',
									cursor: 'pointer',
									userSelect: 'none',
									WebkitTapHighlightColor: 'transparent',
									border: 'none',
								}}
								className='transition-all duration-200 ease-out px-12 sm:px-14 md:px-16 py-5 sm:py-6 rounded-2xl font-black text-xl sm:text-2xl min-w-[130px] sm:min-w-[150px] shadow-lg hover:scale-105 active:scale-95 outline-none focus:ring-4 focus:ring-yellow-400/50 cursor-pointer z-10 pointer-events-auto'
							>
								{btn.label}
							</button>
						))}
					</div>
				</div>

				{/* Chart Type Buttons */}
				<div>
					<h3 className='text-center text-lg sm:text-xl font-bold text-slate-300 mb-4 sm:mb-5'>
						Chart Type
					</h3>
					<div className='flex flex-wrap justify-center gap-4 sm:gap-5 md:gap-6 relative'>
						{chartBtns.map(btn => (
							<button
								key={btn.value}
								type='button'
								tabIndex={0}
								onClick={() => setChartType(btn.value as ChartType)}
								style={{
									background: chartType === btn.value ? btn.color : '#0f3d35',
									color: chartType === btn.value ? '#042f2e' : '#ccfbf1',
									boxShadow:
										chartType === btn.value
											? `0 0 20px ${btn.color}dd, 0 4px 12px rgba(0,0,0,0.3)`
											: '0 2px 8px rgba(0,0,0,0.2)',
									userSelect: 'none',
									WebkitTapHighlightColor: 'transparent',
									border: 'none',
								}}
								className='transition-all duration-200 ease-out px-12 sm:px-14 md:px-16 py-5 sm:py-6 rounded-2xl font-black text-xl sm:text-2xl min-w-[130px] sm:min-w-[160px] shadow-lg hover:scale-105 active:scale-95 outline-none focus:ring-4 focus:ring-green-400/50 cursor-pointer z-10 pointer-events-auto'
							>
								{btn.label}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Time */}
			{now && (
				<div className='flex justify-center my-6 sm:my-8 px-2'>
					<div className='bg-slate-800/90 backdrop-blur-sm px-8 sm:px-10 md:px-12 py-4 sm:py-5 rounded-2xl shadow-xl'>
						<span className='text-slate-200 font-mono text-lg sm:text-xl md:text-2xl font-bold tracking-wide'>
							{now.toLocaleString('en-GB', {
								year: 'numeric',
								month: '2-digit',
								day: '2-digit',
								hour: '2-digit',
								minute: '2-digit',
								second: '2-digit',
								hour12: false,
							})}
						</span>
					</div>
				</div>
			)}

			{/* Color Legend */}
			<div className='flex flex-row flex-wrap justify-center items-center gap-8 sm:gap-12 md:gap-20 pt-8 sm:pt-10 pb-10 sm:pb-12 px-2 sm:px-4'>
				<div className='flex items-center gap-4 sm:gap-5 bg-slate-800/60 px-8 sm:px-10 py-5 sm:py-6 rounded-2xl shadow-lg'>
					<div
						className='w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center'
						style={{ backgroundColor: '#FFD700' }}
					>
						<BiBitcoin className='text-3xl sm:text-4xl text-slate-900' />
					</div>
					<div className='flex flex-col'>
						<span className='text-2xl sm:text-3xl font-black text-yellow-400'>
							Bitcoin
						</span>
						<span className='text-sm text-slate-400 font-semibold'>
							Left axis
						</span>
					</div>
				</div>
				<div className='flex items-center gap-4 sm:gap-5 bg-slate-800/60 px-8 sm:px-10 py-5 sm:py-6 rounded-2xl shadow-lg'>
					<div
						className='w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center'
						style={{ backgroundColor: '#00ffa5' }}
					>
						<SiSolana className='text-3xl sm:text-4xl text-slate-900' />
					</div>
					<div className='flex flex-col'>
						<span className='text-2xl sm:text-3xl font-black text-green-400'>
							Solana
						</span>
						<span className='text-sm text-slate-400 font-semibold'>
							Right axis
						</span>
					</div>
				</div>
			</div>

			{/* Chart */}
			<AnimatePresence mode='wait'>
				<motion.div
					key={chartType + '-' + timeframe + '-chart'}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.98 }}
					transition={{ duration: 0.4, ease: 'easeInOut' }}
					className='rounded-3xl bg-gradient-to-br from-[#181d3b]/92 to-[#101e2c] p-6 sm:p-10 md:p-14 lg:p-16 xl:p-20 shadow-2xl'
				>
					{ChartBlock}
				</motion.div>
			</AnimatePresence>
		</div>
	)
}
