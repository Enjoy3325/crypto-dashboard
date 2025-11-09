'use client'

import { easeInOut, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

import { CryptoChart } from './components/CryptoChart/CryptoChart'
import Preloader from './components/Preloader/Preloader'

interface HomeProps {
	data: { date: string; price: number }[]
}

export default function Home({ data }: HomeProps) {
	const [isLoading, setIsLoading] = useState(true)
	const [neonPulse, setNeonPulse] = useState(false)

	useEffect(() => {
		const timer = setTimeout(() => setIsLoading(false), 2200)
		const interval = setInterval(() => setNeonPulse(v => !v), 1800)
		return () => {
			clearTimeout(timer)
			clearInterval(interval)
		}
	}, [])

	return (
		<div className='min-h-screen bg-[radial-gradient(circle_at_60%_20%,_#2B3169_0%,_#0c134f_80%)] overflow-x-hidden px-0 pb-0 pt-0'>
			{/* Animated Background */}
			<div className='fixed inset-0 overflow-hidden pointer-events-none'>
				<motion.div
					className='absolute w-[800px] h-[800px] bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl'
					animate={{
						x: [0, 120, 0],
						y: [0, 110, 0],
						scale: [1, 1.12, 1],
						opacity: [0.7, 0.85, 0.7],
					}}
					transition={{
						duration: 22,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
					style={{ top: '8%', left: '-18%' }}
				/>
				<motion.div
					className='absolute w-[700px] h-[700px] bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-full blur-3xl'
					animate={{
						x: [0, -90, 0],
						y: [0, -60, 0],
						scale: [1, 1.18, 1],
						opacity: [0.6, 0.95, 0.6],
					}}
					transition={{
						duration: 19,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
					style={{ bottom: '10%', right: '-6%' }}
				/>
			</div>
			{/* Preloader */}
			<Preloader isVisible={isLoading} />

			{/* Main Content */}
			<motion.div
				initial={{ opacity: 0, y: 110 }}
				animate={{ opacity: isLoading ? 0 : 1, y: isLoading ? 110 : 0 }}
				transition={{ duration: 1.1, ease: easeInOut }}
				className='min-h-screen py-10 md:py-14 px-2 md:px-8 relative z-10'
			>
				<header className='flex items-center gap-3 px-6 pt-7 pb-0 w-full max-w-6xl mx-auto'>
					<motion.h2
						className='font-extrabold text-lg md:text-2xl select-none text-6xl'
						animate={{
							textShadow: neonPulse
								? '0 0 22px #FFD700, 0 0 21px #40e0ff, 0 0 14px #fff'
								: '0 0 0 #FFD700, 0 0 0 #40e0ff, 0 0 0 #fff',
							color: neonPulse ? '#FFD700' : '#fae48b',
						}}
						transition={{
							repeat: Infinity,
							duration: 2.5,
							ease: 'easeInOut',
						}}
						style={{ letterSpacing: '.04em' }}
					>
						CryptoHub
					</motion.h2>
				</header>

				<div className='max-w-6xl mx-auto space-y-8 md:space-y-14'>
					{/* Hero Section */}
					<motion.div
						className='mb-8 md:mb-20'
						initial='hidden'
						animate='visible'
						variants={{
							hidden: { opacity: 0, y: 40 },
							visible: {
								opacity: 1,
								y: 0,
								transition: { duration: 0.8, ease: easeInOut },
							},
						}}
					>
						<div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-300/10 via-purple-400/10 to-blue-500/10 border border-gray-700/40 p-10 md:p-24 backdrop-blur-xl shadow-xl'>
							{/* Decorative neon */}
							<motion.div
								className='absolute top-10 right-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-2xl'
								animate={{ scale: [1, 1.18, 1], opacity: [0.3, 0.7, 0.3] }}
								transition={{ duration: 3.2, repeat: Infinity }}
							/>
						</div>
					</motion.div>

					{/* Charts Section */}
					<motion.div
						initial='hidden'
						animate='visible'
						variants={{
							hidden: { opacity: 0, y: 40 },
							visible: {
								opacity: 1,
								y: 0,
								transition: { duration: 0.7, ease: easeInOut },
							},
						}}
					>
						<CryptoChart data={data} />
					</motion.div>
				</div>
			</motion.div>
			<footer className='mt-14 w-full pt-8 pb-9 text-center text-xs text-slate-500 tracking-wider font-light'>
				© {new Date().getFullYear()} CryptoHub
			</footer>
		</div>
	)
}
