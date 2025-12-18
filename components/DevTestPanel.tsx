'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TestTube2, Check, X, Play } from 'lucide-react'
import { printTestResults } from '@/lib/gameTests'

export default function DevTestPanel() {
  // Show only in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)

  const testNotification = async (type: 'win' | 'loss') => {
    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          result: type,
          promoCode: type === 'win' ? '12345' : undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus({ type: 'success', message: 'Отправлено в Telegram' })
      } else {
        setStatus({ type: 'error', message: data.error || 'Ошибка отправки' })
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Ошибка сети' })
    }

    setTimeout(() => setStatus(null), 3000)
  }

  const runTests = () => {
    setStatus({ type: 'info', message: 'Запуск тестов...' })
    
    // Запускаем тесты в следующем тике, чтобы UI обновился
    setTimeout(() => {
      try {
        printTestResults()
        setStatus({ type: 'success', message: 'Тесты выполнены (см. консоль)' })
      } catch (error) {
        setStatus({ type: 'error', message: 'Ошибка в тестах' })
        console.error('Test error:', error)
      }
      
      setTimeout(() => setStatus(null), 5000)
    }, 100)
  }

  return (
    <div className="fixed bottom-16 right-16 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-[60px] right-0 glass-card rounded-soft p-16 w-[240px] space-y-8"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-caption font-semibold text-gray-700 mb-12">
              Dev Test Panel
            </div>

            <button
              onClick={() => testNotification('win')}
              className="w-full bg-soft-success hover:bg-soft-success/80 text-gray-800 px-12 py-8 rounded-soft text-caption font-medium transition-colors"
            >
              Тест: Победа
            </button>

            <button
              onClick={() => testNotification('loss')}
              className="w-full bg-soft-error hover:bg-soft-error/80 text-gray-800 px-12 py-8 rounded-soft text-caption font-medium transition-colors"
            >
              Тест: Проигрыш
            </button>

            <div className="border-t border-warm-gray/30 my-8"></div>

            <button
              onClick={runTests}
              className="w-full bg-lavender hover:bg-lavender/80 text-gray-800 px-12 py-8 rounded-soft text-caption font-medium transition-colors flex items-center justify-center gap-6"
            >
              <Play className="w-12 h-12" />
              Запустить тесты (10k)
            </button>

            {/* Status toast */}
            <AnimatePresence>
              {status && (
                <motion.div
                  className={`flex items-center gap-8 px-12 py-8 rounded-soft text-caption ${
                    status.type === 'success' 
                      ? 'bg-soft-success' 
                      : status.type === 'error' 
                      ? 'bg-soft-error'
                      : 'bg-blush'
                  }`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  {status.type === 'success' ? (
                    <Check className="w-12 h-12" />
                  ) : status.type === 'error' ? (
                    <X className="w-12 h-12" />
                  ) : (
                    <Play className="w-12 h-12" />
                  )}
                  <span className="flex-1">{status.message}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-card rounded-full w-48 h-48 flex items-center justify-center text-deep-rose hover:shadow-lg transition-shadow"
        title="Dev Test Panel"
      >
        <TestTube2 className="w-20 h-20" />
      </button>
    </div>
  )
}
