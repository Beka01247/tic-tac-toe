'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Check, X as XIcon } from 'lucide-react'
import { getOrCreateSessionId, checkTelegramConnection, tryConnectTelegram, getTelegramConnectLink } from '@/lib/telegramSession'

export default function TelegramConnect() {
  const [sessionId, setSessionId] = useState<string>('')
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isChecking, setIsChecking] = useState<boolean>(false)
  const [showBanner, setShowBanner] = useState<boolean>(false)

  useEffect(() => {
    // Получить или создать session ID
    const id = getOrCreateSessionId()
    setSessionId(id)

    // Проверить статус подключения
    checkConnection(id)
  }, [])

  const checkConnection = async (id: string) => {
    setIsChecking(true)
    const connected = await checkTelegramConnection(id)
    setIsConnected(connected)
    setIsChecking(false)
  }

  const handleConnect = () => {
    if (!sessionId) return

    // Открыть Telegram deep link
    const link = getTelegramConnectLink(sessionId)
    window.open(link, '_blank')

    // Показать баннер с инструкцией
    setShowBanner(true)

    // Начать polling статуса (каждые 2 секунды)
    startPolling()
  }

  const startPolling = () => {
    let attempts = 0
    const maxAttempts = 30 // 60 секунд максимум

    const interval = setInterval(async () => {
      attempts++

      // Сначала пытаемся установить соединение (для локальной разработки)
      const tryConnect = await tryConnectTelegram(sessionId)
      
      if (tryConnect) {
        setIsConnected(true)
        setShowBanner(false)
        clearInterval(interval)
        return
      }

      // Если не получилось, проверяем статус (для webhook на production)
      const connected = await checkTelegramConnection(sessionId)
      
      if (connected) {
        setIsConnected(true)
        setShowBanner(false)
        clearInterval(interval)
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval)
        setShowBanner(false)
      }
    }, 2000)
  }

  return (
    <div className="relative">
      {/* Статус подключения */}
      <motion.div
        className={`flex items-center gap-6 px-12 py-6 rounded-soft text-caption ${
          isConnected ? 'bg-soft-success/60' : 'bg-blush/40'
        }`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {isChecking ? (
          <>
            <div className="w-10 h-10 border-2 border-deep-rose border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-700 text-sm">Проверка...</span>
          </>
        ) : isConnected ? (
          <>
            <span className="text-gray-800 font-medium text-sm w-full text-center">Telegram подключён</span>
          </>
        ) : (
          <>
            <span className="text-gray-700 text-sm ml-28">Telegram не подключён</span>
            <button
              onClick={handleConnect}
              className="ml-auto mr-16 btn-secondary !py-2 !px-8 text-sm flex items-center gap-2"
            >
              <ExternalLink className="w-12 h-12" />
              Подключить
            </button>
          </>
        )}
      </motion.div>

      {/* Баннер с инструкцией */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            className="absolute top-full mt-8 left-0 right-0 glass-card p-16 rounded-soft border-2 border-deep-rose/30 z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
          >
            <div className="flex items-start gap-12">
              <div className="w-24 h-24 bg-deep-rose/20 rounded-full flex items-center justify-center flex-shrink-0 mt-2">
                <span className="text-lg">📱</span>
              </div>
              <div className="flex-1">
                <h3 className="text-body font-semibold text-gray-800 mb-4">
                  Откройте Telegram
                </h3>
                <p className="text-caption text-gray-600 leading-relaxed">
                  1. В открывшемся окне Telegram нажмите <strong>"Start"</strong>
                  <br />
                  2. Вернитесь на эту страницу
                  <br />
                  3. Подключение установится автоматически
                </p>
              </div>
              <button
                onClick={() => setShowBanner(false)}
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                <XIcon className="w-16 h-16" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
