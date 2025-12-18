'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface StatusBarProps {
  isComputerThinking: boolean
  currentPlayer: 'X' | 'O'
  gameOver: boolean
}

export default function StatusBar({ isComputerThinking, currentPlayer, gameOver }: StatusBarProps) {
  if (gameOver) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isComputerThinking ? 'thinking' : 'player'}
        className="status-bar"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
      >
        {isComputerThinking ? (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-lavender" />
            <span>Компьютер думает…</span>
          </>
        ) : (
          <>
            <span className="text-deep-rose text-base font-serif">✨</span>
            <span>Ваш ход</span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
