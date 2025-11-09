'use client'

import { Variants, motion } from 'framer-motion'

import { CryptoChart } from '../CryptoChart/CryptoChart'

const containerVariants: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.8, ease: 'easeOut' },
	},
}

interface ChartContainerProps {
	data: { date: string; price: number }[]
}

export default function ChartContainer({ data }: ChartContainerProps) {
	return (
		<motion.div
			className='relative bg-gradient-to-br from-[#10193f] via-[#1E293B]/90 to-[#080D23] rounded-3xl border border-cyan-400/20 p-8 backdrop-blur-2xl shadow-[0_8px_48px_0_rgba(26,224,245,0.11)] overflow-hidden'
			variants={containerVariants}
			initial='hidden'
			animate='visible'
			transition={{ delay: 0.2 }}
			whileHover={{
				scale: 1.01,
				boxShadow: '0 8px 64px 0 rgba(21,229,245,0.25)',
			}}
		>
			<div className='flex items-center justify-between mb-8'>
				<div>
					<h2 className='text-2xl font-bold text-cyan-100 mb-1 tracking-wide'>
						Market Analysis
					</h2>
					<p className='text-sm text-cyan-400/80'>
						Real-time & Historical Data
					</p>
				</div>
				<div className='flex items-center gap-3'>
					<div className='px-3 py-1 bg-green-500/20 rounded-full border border-green-300/20 backdrop-blur-[2px] shadow-md'>
						<span className='text-xs text-green-400 font-medium animate-pulse'>
							Live
						</span>
					</div>
					<div className='px-3 py-1 bg-blue-500/20 rounded-full border border-cyan-400/20 shadow-md'>
						<span className='text-xs text-cyan-300 font-medium'>
							Auto-update
						</span>
					</div>
				</div>
			</div>
			<CryptoChart data={data} />
			<div className='absolute -top-24 -right-24 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl' />
			<div className='absolute -bottom-24 -left-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl' />
		</motion.div>
	)
}
