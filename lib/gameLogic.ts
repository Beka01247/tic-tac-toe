export type Player = "X" | "O" | null;
export type Board = Player[];

// Паттерны победы
const WIN_PATTERNS = [
  [0, 1, 2], // rows
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6], // columns
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8], // diagonals
  [2, 4, 6],
];

// Проверка победы
export function checkWinner(board: Board): Player {
  for (const pattern of WIN_PATTERNS) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

// Получить индексы победной линии
export function getWinningLine(board: Board): number[] | null {
  for (const pattern of WIN_PATTERNS) {
    const [a, b, c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return pattern;
    }
  }
  return null;
}

// Проверка ничьи
export function checkDraw(board: Board): boolean {
  return board.every((cell) => cell !== null) && !checkWinner(board);
}

// Получить доступные ходы
function getAvailableMoves(board: Board): number[] {
  return board
    .map((cell, index) => (cell === null ? index : -1))
    .filter((index) => index !== -1);
}

// Minimax алгоритм для непобедимого AI
export function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  alpha: number = -Infinity,
  beta: number = Infinity
): { score: number; move?: number } {
  const winner = checkWinner(board);

  // Терминальные состояния
  if (winner === "O") return { score: 10 - depth };
  if (winner === "X") return { score: depth - 10 };
  if (checkDraw(board)) return { score: 0 };

  const availableMoves = getAvailableMoves(board);

  if (isMaximizing) {
    let maxScore = -Infinity;
    let bestMove: number | undefined;

    for (const move of availableMoves) {
      board[move] = "O";
      const { score } = minimax(board, depth + 1, false, alpha, beta);
      board[move] = null;

      if (score > maxScore) {
        maxScore = score;
        bestMove = move;
      }

      alpha = Math.max(alpha, score);
      if (beta <= alpha) break; // Alpha-beta pruning
    }

    return { score: maxScore, move: bestMove };
  } else {
    let minScore = Infinity;

    for (const move of availableMoves) {
      board[move] = "X";
      const { score } = minimax(board, depth + 1, true, alpha, beta);
      board[move] = null;

      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break; // Alpha-beta pruning
    }

    return { score: minScore };
  }
}

// Получить лучший ход для компьютера (с добавленной случайностью)
export function getBestMove(board: Board): number {
  const availableMoves = board
    .map((cell, index) => (cell === null ? index : -1))
    .filter((index) => index !== -1);

  // Если нет доступных ходов, вернуть 0
  if (availableMoves.length === 0) return 0;

  // С вероятностью 40% делаем случайный ход (это делает бота побеждаемым)
  // С вероятностью 60% используем оптимальную стратегию
  const makeRandomMove = Math.random() < 0.4;

  if (makeRandomMove) {
    // Случайный ход из доступных
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }

  // Оптимальный ход через minimax
  const { move } = minimax([...board], 0, true);
  return move ?? availableMoves[0];
}

// Генерация промокода (ровно 5 символов, могут быть ведущие нули)
export function generatePromoCode(): string {
  return Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
}
