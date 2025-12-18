'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, Sparkles } from 'lucide-react'
import Confetti from './Confetti'

interface WinModalProps {
  show: boolean
  result: 'win' | 'loss' | 'draw'
  promoCode?: string
  onPlayAgain: () => void
}

export default function WinModal({ show, result, promoCode, onPlayAgain }: WinModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (promoCode) {
      await navigator.clipboard.writeText(promoCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-16 bg-black/20 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {result === 'win' && <Confetti />}
        
        <motion.div
          className="bg-ivory/95 backdrop-blur-lg shadow-2xl rounded-softest p-32 max-w-[400px] w-full relative overflow-hidden border border-warm-gray/30"
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {/* Decorative perforated line */}
          {result === 'win' && (
            <div className="absolute top-[140px] left-0 right-0 h-[1px] border-t-2 border-dashed border-warm-gray/40" />
          )}

          <div className="text-center space-y-20">
            {/* Icon */}
            <motion.div
              className="flex justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              {result === 'win' && (
                <div className="w-64 h-64 rounded-full bg-soft-success/40 flex items-center justify-center">
                  <Sparkles className="w-32 h-32 text-deep-rose" />
                </div>
              )}
              {result === 'loss' && (
                <div className="w-64 h-64 rounded-full bg-blush/40 flex items-center justify-center">
                  <span className="text-4xl">😊</span>
                </div>
              )}
              {result === 'draw' && (
                <div className="w-64 h-64 rounded-full bg-lavender/40 flex items-center justify-center">
                  <span className="text-4xl">🤝</span>
                </div>
              )}
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-h1 font-serif text-gray-800"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {result === 'win' && 'Победа! 🎉'}
              {result === 'loss' && 'Ничего страшного'}
              {result === 'draw' && 'Ничья'}
            </motion.h2>

            {/* Description */}
            <motion.p
              className="text-body text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {result === 'win' && 'Ваш промокод на скидку:'}
              {result === 'loss' && 'Попробуем ещё раз?'}
              {result === 'draw' && 'Это была честная игра'}
            </motion.p>

            {/* Promo Code */}
            {result === 'win' && promoCode && (
              <motion.div
                className="glass-card rounded-soft p-16 bg-blush/30 relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-3xl font-serif tracking-widest text-deep-rose mb-8">
                  {promoCode}
                </div>
                <button
                  onClick={handleCopy}
                  className="btn-secondary w-full flex items-center justify-center gap-8"
                >
                  {copied ? (
                    <>
                      <Check className="w-16 h-16" />
                      <span>Скопировано</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-16 h-16" />
                      <span>Скопировать код</span>
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* Play Again Button */}
            <motion.button
              onClick={onPlayAgain}
              className="btn-primary w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Сыграть ещё раз
            </motion.button>
          </div>

          {/* Toast for copied */}
          <AnimatePresence>
            {copied && (
              <motion.div
                className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-16 py-8 rounded-soft text-caption"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                Скопировано в буфер обмена
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
