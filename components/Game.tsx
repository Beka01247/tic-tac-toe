'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import GameBoard from './Board'
import StatusBar from './StatusBar'
import WinModal from './WinModal'
import TelegramConnect from './TelegramConnect'
import { type Board, checkWinner, checkDraw, getBestMove, generatePromoCode, getWinningLine } from '@/lib/gameLogic'
import { sendTelegramNotification } from '@/lib/telegram'

type GameResult = 'win' | 'loss' | 'draw' | null

export default function Game() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [isComputerThinking, setIsComputerThinking] = useState(false)
  const [gameResult, setGameResult] = useState<GameResult>(null)
  const [promoCode, setPromoCode] = useState<string | undefined>()
  const [winningLine, setWinningLine] = useState<number[] | null>(null)
  
  // Ref для отмены таймера хода бота
  const botMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  // Ref для предотвращения дублирования Telegram уведомлений
  const telegramSentRef = useRef<boolean>(false)

  // Функция оценки состояния доски
  const evaluateBoard = (currentBoard: Board): { result: GameResult; line: number[] | null } => {
    const winner = checkWinner(currentBoard)
    const line = getWinningLine(currentBoard)
    
    if (winner === 'X') {
      return { result: 'win', line }
    } else if (winner === 'O') {
      return { result: 'loss', line }
    } else if (checkDraw(currentBoard)) {
      return { result: 'draw', line: null }
    }
    
    return { result: null, line: null }
  }

  // Финализация победы игрока
  const finalizePlayerWin = (line: number[] | null) => {
    const code = generatePromoCode()
    setWinningLine(line)
    setPromoCode(code)
    setGameResult('win')
    setIsComputerThinking(false)
    
    // Отправить в Telegram только один раз
    if (!telegramSentRef.current) {
      telegramSentRef.current = true
      sendTelegramNotification('win', code)
    }
  }

  // Финализация победы бота
  const finalizeBotWin = (line: number[] | null) => {
    setWinningLine(line)
    setGameResult('loss')
    setIsComputerThinking(false)
    
    // Отправить в Telegram только один раз
    if (!telegramSentRef.current) {
      telegramSentRef.current = true
      sendTelegramNotification('loss')
    }
  }

  // Финализация ничьи
  const finalizeDraw = () => {
    setGameResult('draw')
    setIsComputerThinking(false)
  }

  // Ход игрока
  const handleCellClick = (index: number) => {
    // Проверки: только ход игрока, клетка пуста, игра не окончена, бот не думает
    if (!isPlayerTurn || board[index] !== null || gameResult !== null || isComputerThinking) {
      return
    }

    // Применяем ход игрока
    const newBoard = [...board]
    newBoard[index] = 'X'
    
    // КРИТИЧЕСКИ ВАЖНО: Оцениваем состояние СРАЗУ после хода игрока
    const evaluation = evaluateBoard(newBoard)
    
    // Обновляем доску
    setBoard(newBoard)
    
    // Проверяем терминальное состояние
    if (evaluation.result === 'win') {
      finalizePlayerWin(evaluation.line)
      return // СТОП - игра окончена, бот не ходит
    }
    
    if (evaluation.result === 'draw') {
      finalizeDraw()
      return // СТОП - игра окончена
    }
    
    // Игра продолжается - планируем ход бота
    setIsPlayerTurn(false)
    scheduleBotMove(newBoard)
  }

  // Планирование хода бота
  const scheduleBotMove = (currentBoard: Board) => {
    // Отменяем предыдущий таймер, если есть
    if (botMoveTimeoutRef.current) {
      clearTimeout(botMoveTimeoutRef.current)
      botMoveTimeoutRef.current = null
    }

    setIsComputerThinking(true)

    // Задержка для "думания" компьютера (300-600ms)
    const delay = 300 + Math.random() * 300
    
    botMoveTimeoutRef.current = setTimeout(() => {
      // КРИТИЧЕСКИ ВАЖНО: Проверяем, не завершилась ли игра
      if (gameResult !== null) {
        setIsComputerThinking(false)
        return // Игра уже окончена, не делаем ход
      }

      // Выполняем ход бота
      const bestMove = getBestMove(currentBoard)
      const newBoard = [...currentBoard]
      newBoard[bestMove] = 'O'
      
      // Оцениваем состояние после хода бота
      const evaluation = evaluateBoard(newBoard)
      
      // Обновляем доску
      setBoard(newBoard)
      setIsComputerThinking(false)
      
      // Проверяем терминальное состояние
      if (evaluation.result === 'loss') {
        finalizeBotWin(evaluation.line)
        return
      }
      
      if (evaluation.result === 'draw') {
        finalizeDraw()
        return
      }
      
      // Игра продолжается - ход игрока
      setIsPlayerTurn(true)
    }, delay)
  }

  // Cleanup при размонтировании компонента
  useEffect(() => {
    return () => {
      if (botMoveTimeoutRef.current) {
        clearTimeout(botMoveTimeoutRef.current)
      }
    }
  }, [])

  const handlePlayAgain = () => {
    // Отменяем любой запланированный ход бота
    if (botMoveTimeoutRef.current) {
      clearTimeout(botMoveTimeoutRef.current)
      botMoveTimeoutRef.current = null
    }
    
    // Сбрасываем флаг Telegram
    telegramSentRef.current = false
    
    // Сбрасываем состояние игры
    setBoard(Array(9).fill(null))
    setIsPlayerTurn(true)
    setIsComputerThinking(false)
    setGameResult(null)
    setPromoCode(undefined)
    setWinningLine(null)
  }

  return (
    <motion.div
      className="w-full max-w-[460px] mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="text-center mb-24"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-h1 font-serif text-gray-800 mb-12">
          Крестики-нолики
        </h1>
        <p className="text-body text-gray-600">
          Cыграем раунд? ✨
        </p>
      </motion.div>

      {/* Telegram Connect */}
      <motion.div
        className="mb-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <TelegramConnect />
      </motion.div>

      {/* Status Bar */}
      <motion.div
        className="mb-24 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <StatusBar
          isComputerThinking={isComputerThinking}
          currentPlayer={isPlayerTurn ? 'X' : 'O'}
          gameOver={gameResult !== null}
        />
      </motion.div>

      {/* Game Board */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
      >
        <GameBoard
          board={board}
          onCellClick={handleCellClick}
          disabled={!isPlayerTurn || isComputerThinking || gameResult !== null}
          winningLine={winningLine}
        />
      </motion.div>

      {/* New Game Button (показывается после игры) */}
      {gameResult && (
        <motion.div
          className="mt-24 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button onClick={handlePlayAgain} className="btn-secondary">
            Новая игра
          </button>
        </motion.div>
      )}

      {/* Win/Loss/Draw Modal */}
      <WinModal
        show={gameResult !== null}
        result={gameResult || 'draw'}
        promoCode={promoCode}
        onPlayAgain={handlePlayAgain}
      />
    </motion.div>
  )
}
