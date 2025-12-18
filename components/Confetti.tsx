'use client'

import { motion } from 'framer-motion'

// Минималистичное конфетти
export default function Confetti() {
  const confettiPieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 1,
    color: ['#C9A2A6', '#F4E0DD', '#E8DDEF', '#D4E5D4'][Math.floor(Math.random() * 4)],
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-8 h-8 rounded-full opacity-60"
          style={{
            left: `${piece.left}%`,
            top: '-10%',
            backgroundColor: piece.color,
          }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{
            y: '110vh',
            opacity: 0,
            rotate: 360,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}
