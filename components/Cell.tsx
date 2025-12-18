'use client'

import { motion } from 'framer-motion'
import { type Player } from '@/lib/gameLogic'

interface CellProps {
  value: Player
  onClick: () => void
  disabled: boolean
  index: number
  showPreview?: boolean
  isWinning?: boolean
}

export default function Cell({ value, onClick, disabled, index, showPreview, isWinning }: CellProps) {
  const isClickable = !disabled && value === null

  return (
    <motion.button
      className={`game-cell ${disabled ? 'cell-disabled' : ''} ${value ? 'cell-filled' : ''} ${
        isClickable ? 'cell-clickable' : ''
      } ${isWinning ? 'cell-winning' : ''}`}
      onClick={onClick}
      disabled={disabled || value !== null}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: 'easeOut' }}
      whileHover={isClickable ? { scale: 1.02 } : {}}
      whileTap={isClickable ? { scale: 0.97 } : {}}
    >
      {/* Основное значение (X или O) */}
      {value && (
        <motion.div
          className={`cell-value ${value === 'X' ? 'cell-value-x' : 'cell-value-o'}`}
          initial={{ scale: 0, rotate: value === 'X' ? -180 : 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 260, 
            damping: 20,
            duration: 0.4 
          }}
        >
          {value}
        </motion.div>
      )}

      {/* Ghost preview при hover */}
      {!value && showPreview && (
        <motion.div
          className="cell-preview"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
        >
          X
        </motion.div>
      )}
    </motion.button>
  )
}
