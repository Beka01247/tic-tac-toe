'use client'

import { useState } from 'react'
import Cell from './Cell'
import { type Board } from '@/lib/gameLogic'

interface BoardProps {
  board: Board
  onCellClick: (index: number) => void
  disabled: boolean
  winningLine: number[] | null
}

// Выберите вариант: 'tiles' (отдельные плитки) или 'grid' (линии-разделители)
const BOARD_VARIANT: 'tiles' | 'grid' = 'tiles'

export default function GameBoard({ board, onCellClick, disabled, winningLine }: BoardProps) {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null)

  if (BOARD_VARIANT === 'tiles') {
    // VARIANT B: Отдельные плитки (РЕКОМЕНДУЕТСЯ - четче и понятнее)
    return (
      <div className="board-container-tiles">
        <div className="board-grid-tiles">
          {board.map((cell, index) => (
            <div
              key={index}
              onMouseEnter={() => !disabled && !cell && setHoveredCell(index)}
              onMouseLeave={() => setHoveredCell(null)}
            >
              <Cell
                value={cell}
                onClick={() => onCellClick(index)}
                disabled={disabled}
                index={index}
                showPreview={hoveredCell === index}
                isWinning={winningLine?.includes(index) || false}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // VARIANT A: Единая карточка с линиями-разделителями
  return (
    <div className="board-container-grid">
      <div className="board-grid-lines">
        {board.map((cell, index) => (
          <div
            key={index}
            className={`board-cell-wrapper ${
              index % 3 !== 2 ? 'border-r-2 border-deep-rose/20' : ''
            } ${
              index < 6 ? 'border-b-2 border-deep-rose/20' : ''
            }`}
            onMouseEnter={() => !disabled && !cell && setHoveredCell(index)}
            onMouseLeave={() => setHoveredCell(null)}
          >
            <Cell
              value={cell}
              onClick={() => onCellClick(index)}
              disabled={disabled}
              index={index}
              showPreview={hoveredCell === index}
              isWinning={winningLine?.includes(index) || false}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
