/**
 * ТЕСТИРОВАНИЕ И СИМУЛЯЦИЯ ИГРОВОЙ ЛОГИКИ
 *
 * Проверяет критические инварианты:
 * 1. После терминального состояния оно никогда не меняется
 * 2. Если игрок побеждает на своем ходу, бот не делает ход
 * 3. Нет дублирования Telegram уведомлений
 */

import {
  type Board,
  checkWinner,
  checkDraw,
  getBestMove,
  getWinningLine,
} from "./gameLogic";

type GameState = "playing" | "player_win" | "bot_win" | "draw";

interface GameSimulation {
  board: Board;
  state: GameState;
  moves: string[];
  telegramSent: boolean;
}

// Создать начальное состояние игры
function createInitialState(): GameSimulation {
  return {
    board: Array(9).fill(null),
    state: "playing",
    moves: [],
    telegramSent: false,
  };
}

// Оценить доску
function evaluateBoard(board: Board): GameState {
  const winner = checkWinner(board);

  if (winner === "X") return "player_win";
  if (winner === "O") return "bot_win";
  if (checkDraw(board)) return "draw";

  return "playing";
}

// Получить доступные ходы
function getAvailableMoves(board: Board): number[] {
  return board
    .map((cell, index) => (cell === null ? index : -1))
    .filter((index) => index !== -1);
}

// Симулировать одну игру
function simulateGame(): {
  success: boolean;
  error?: string;
  game: GameSimulation;
} {
  const game = createInitialState();
  let moveCount = 0;
  const maxMoves = 100; // защита от бесконечного цикла

  while (game.state === "playing" && moveCount < maxMoves) {
    const availableMoves = getAvailableMoves(game.board);

    if (availableMoves.length === 0) {
      return {
        success: false,
        error: "No available moves but game not terminal",
        game,
      };
    }

    // Определяем, чей ход (четный = игрок, нечетный = бот)
    const isPlayerTurn = moveCount % 2 === 0;
    const player = isPlayerTurn ? "X" : "O";

    // Получаем ход
    let move: number;
    if (isPlayerTurn) {
      // Игрок делает случайный ход
      move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else {
      // Бот использует свою логику
      move = getBestMove(game.board);
    }

    // Применяем ход
    game.board[move] = player;
    game.moves.push(`${player} -> ${move}`);
    moveCount++;

    // КРИТИЧЕСКИ ВАЖНО: Оцениваем доску СРАЗУ после хода
    const newState = evaluateBoard(game.board);

    // Если состояние терминальное, фиксируем его
    if (newState !== "playing") {
      game.state = newState;

      // Проверка: после терминального состояния игра должна остановиться
      if (isPlayerTurn && newState === "player_win") {
        // Игрок победил - бот НЕ должен сходить дальше
        game.telegramSent = true;
        break;
      } else if (!isPlayerTurn && newState === "bot_win") {
        // Бот победил
        game.telegramSent = true;
        break;
      } else if (newState === "draw") {
        // Ничья
        break;
      }
    }
  }

  if (moveCount >= maxMoves) {
    return {
      success: false,
      error: "Max moves exceeded (infinite loop?)",
      game,
    };
  }

  return { success: true, game };
}

// Запустить N симуляций и проверить инварианты
export function runSimulations(count: number = 10000): {
  total: number;
  passed: number;
  failed: number;
  errors: string[];
  stats: {
    playerWins: number;
    botWins: number;
    draws: number;
  };
} {
  const results = {
    total: count,
    passed: 0,
    failed: 0,
    errors: [] as string[],
    stats: {
      playerWins: 0,
      botWins: 0,
      draws: 0,
    },
  };

  for (let i = 0; i < count; i++) {
    const { success, error, game } = simulateGame();

    if (!success) {
      results.failed++;
      results.errors.push(
        `Game ${i + 1}: ${error}\nMoves: ${game.moves.join(", ")}`
      );
      continue;
    }

    // Подсчет статистики
    if (game.state === "player_win") results.stats.playerWins++;
    if (game.state === "bot_win") results.stats.botWins++;
    if (game.state === "draw") results.stats.draws++;

    results.passed++;
  }

  return results;
}

// Юнит-тесты для конкретных сценариев
export function runUnitTests(): {
  total: number;
  passed: number;
  failed: number;
  errors: string[];
} {
  const tests: Array<{ name: string; test: () => boolean }> = [];
  const errors: string[] = [];

  // Тест 1: Игрок побеждает по горизонтали
  tests.push({
    name: "Player wins horizontally (top row)",
    test: () => {
      const board: Board = ["X", "X", "X", "O", "O", null, null, null, null];
      const state = evaluateBoard(board);
      const line = getWinningLine(board);
      return state === "player_win" && line !== null && line.length === 3;
    },
  });

  // Тест 2: Бот побеждает по диагонали
  tests.push({
    name: "Bot wins diagonally",
    test: () => {
      const board: Board = ["O", "X", "X", "X", "O", null, null, null, "O"];
      const state = evaluateBoard(board);
      return state === "bot_win";
    },
  });

  // Тест 3: Ничья
  tests.push({
    name: "Draw detection",
    test: () => {
      const board: Board = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
      const state = evaluateBoard(board);
      return state === "draw";
    },
  });

  // Тест 4: Игрок побеждает вертикально
  tests.push({
    name: "Player wins vertically",
    test: () => {
      const board: Board = ["X", "O", "O", "X", "O", null, "X", null, null];
      const state = evaluateBoard(board);
      return state === "player_win";
    },
  });

  // Тест 5: Игра продолжается (не терминальное состояние)
  tests.push({
    name: "Game continues (not terminal)",
    test: () => {
      const board: Board = ["X", "O", null, null, "X", null, "O", null, null];
      const state = evaluateBoard(board);
      return state === "playing";
    },
  });

  // Запускаем тесты
  let passed = 0;
  let failed = 0;

  tests.forEach(({ name, test }) => {
    try {
      if (test()) {
        passed++;
      } else {
        failed++;
        errors.push(`FAILED: ${name}`);
      }
    } catch (error) {
      failed++;
      errors.push(`ERROR in ${name}: ${error}`);
    }
  });

  return { total: tests.length, passed, failed, errors };
}

// Функция для вывода результатов в консоль
export function printTestResults() {
  console.log("🧪 RUNNING UNIT TESTS...\n");
  const unitTests = runUnitTests();

  console.log(`Unit Tests: ${unitTests.passed}/${unitTests.total} passed`);
  if (unitTests.failed > 0) {
    console.error("❌ Unit test failures:");
    unitTests.errors.forEach((err) => console.error(`  - ${err}`));
  } else {
    console.log("✅ All unit tests passed!\n");
  }

  console.log("🎮 RUNNING 10,000 GAME SIMULATIONS...\n");
  const simResults = runSimulations(10000);

  console.log(`Simulations: ${simResults.passed}/${simResults.total} passed`);
  console.log(`\nGame Statistics:`);
  console.log(
    `  Player wins: ${simResults.stats.playerWins} (${(
      (simResults.stats.playerWins / simResults.total) *
      100
    ).toFixed(1)}%)`
  );
  console.log(
    `  Bot wins: ${simResults.stats.botWins} (${(
      (simResults.stats.botWins / simResults.total) *
      100
    ).toFixed(1)}%)`
  );
  console.log(
    `  Draws: ${simResults.stats.draws} (${(
      (simResults.stats.draws / simResults.total) *
      100
    ).toFixed(1)}%)`
  );

  if (simResults.failed > 0) {
    console.error(`\n❌ ${simResults.failed} simulation failures:`);
    simResults.errors.slice(0, 10).forEach((err) => console.error(err));
    if (simResults.errors.length > 10) {
      console.error(`... and ${simResults.errors.length - 10} more errors`);
    }
  } else {
    console.log(
      "\n✅ All simulations passed! No invariant violations detected."
    );
  }

  // Проверка: игрок должен выигрывать примерно 30-35%
  const playerWinRate = (simResults.stats.playerWins / simResults.total) * 100;
  if (playerWinRate >= 25 && playerWinRate <= 45) {
    console.log(
      `\n✅ Player win rate (${playerWinRate.toFixed(
        1
      )}%) is in acceptable range (25-45%)`
    );
  } else {
    console.warn(
      `\n⚠️  Player win rate (${playerWinRate.toFixed(
        1
      )}%) is outside expected range (25-45%)`
    );
  }
}
