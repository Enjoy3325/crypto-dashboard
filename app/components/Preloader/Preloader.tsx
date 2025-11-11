'use client'

import { AnimatePresence, motion } from 'framer-motion'

import { BiBitcoin } from 'react-icons/bi'
import { SiSolana } from 'react-icons/si'

interface PreloaderProps {
  isVisible: boolean
}

export default function Preloader({ isVisible }: PreloaderProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -400 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center min-h-screen min-w-full bg-gradient-to-br from-slate-900 via-slate-950 to-black"
        >
          <div className="flex flex-col items-center justify-center w-full h-full">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: [0, -12, 0] }}
              exit={{ opacity: 0, y: -150 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-7xl md:text-9xl font-extrabold mb-16 text-yellow-300 drop-shadow-[0_0_36px_rgba(255,215,0,0.9)] tracking-widest text-center select-none"
              style={{
                textShadow: '0 0 38px #ffce27, 0 0 18px #fff400'
              }}
            >
              CryptoHub
            </motion.h1>
            <div className="flex flex-row items-center justify-center w-[360px] md:w-[495px] h-[270px] md:h-[340px]">
              <motion.div
                animate={{
                  rotate: [0, -360],
                  rotateX: [0, 28, -28, 0],
                  rotateY: [0, 18, -18, 0],
                  scale: [1.08, 1.14, 1.08],
                  filter: [
                    'drop-shadow(0 0 30px #ffe786) drop-shadow(0 0 70px #ffe786)',
                    'drop-shadow(0 0 45px #ffe786) drop-shadow(0 0 85px #ffd700)',
                    'drop-shadow(0 0 30px #ffe786) drop-shadow(0 0 70px #ffe786)'
                  ]
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="flex items-center justify-center rounded-full bg-transparent text-yellow-300 text-[210px] md:text-[260px]"
                style={{ marginRight: '-22px' }}
              >
                <BiBitcoin />
              </motion.div>
              <motion.div
                animate={{
                  rotate: [0, 360],
                  rotateX: [0, -25, 25, 0],
                  rotateY: [0, -16, 16, 0],
                  scale: [1.03, 1.08, 1.03],
                  filter: [
                    'drop-shadow(0 0 35px #43f7c2) drop-shadow(0 0 75px #12fec6)',
                    'drop-shadow(0 0 50px #43f7c2) drop-shadow(0 0 95px #12fec6)',
                    'drop-shadow(0 0 35px #43f7c2) drop-shadow(0 0 75px #12fec6)'
                  ]
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="flex items-center justify-center rounded-full bg-transparent text-cyan-300 text-[150px] md:text-[204px]"
                style={{ marginLeft: '-18px' }}
              >
                <SiSolana />
              </motion.div>
            </div>
            <motion.div
              initial={{ scaleX: 0.4, opacity: 0.7 }}
              animate={{ scaleX: [1, 0.4, 1], opacity: [1, 0.7, 1] }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 7,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
              }}
              className="mt-16 h-[8px] w-[340px] md:w-[420px] origin-center bg-gradient-to-r from-yellow-200 via-white to-cyan-200 rounded-full shadow-[0_0_42px_rgb(255,255,255,1)]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
