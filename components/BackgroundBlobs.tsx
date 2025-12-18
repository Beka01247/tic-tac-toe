'use client'

import { motion } from 'framer-motion'

export default function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Blob 1 - Blush */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-blush/30 blur-[80px]"
        animate={{
          x: [0, 50, 0],
          y: [0, 80, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          top: '10%',
          left: '-10%',
        }}
      />

      {/* Blob 2 - Lavender */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-lavender/25 blur-[90px]"
        animate={{
          x: [0, -60, 0],
          y: [0, 100, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          top: '40%',
          right: '-15%',
        }}
      />

      {/* Blob 3 - Deep Rose */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-deep-rose/20 blur-[70px]"
        animate={{
          x: [0, 40, 0],
          y: [0, -60, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          bottom: '15%',
          left: '40%',
        }}
      />
    </div>
  )
}
