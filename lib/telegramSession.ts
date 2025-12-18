// Генерация уникального session ID
export function generateSessionId(): string {
  return (
    "session_" +
    Math.random().toString(36).substring(2) +
    Date.now().toString(36)
  );
}

// Получить session ID из localStorage (или создать новый)
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";

  const storageKey = "tic_tac_toe_session_id";
  let sessionId = localStorage.getItem(storageKey);

  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(storageKey, sessionId);
  }

  return sessionId;
}

// Сохранить chatId в localStorage (для Vercel без KV)
export function saveChatId(chatId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("telegram_chat_id", chatId);
}

// Получить chatId из localStorage
export function getChatId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("telegram_chat_id");
}

// Получить deep link для подключения Telegram
export function getTelegramConnectLink(sessionId: string): string {
  // Username бота - нужно будет указать в .env
  const botUsername =
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "YOUR_BOT_USERNAME";
  return `https://t.me/${botUsername}?start=${sessionId}`;
}

/**
 * Проверить статус подключения Telegram для данной сессии
 */
export async function checkTelegramConnection(
  sessionId: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/telegram/status?sessionId=${sessionId}`);

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.connected === true;
  } catch (error) {
    console.error("Failed to check Telegram connection:", error);
    return false;
  }
}

/**
 * Попытаться установить подключение (для локальной разработки без webhook)
 * Использует getUpdates вместо webhook
 */
export async function tryConnectTelegram(
  sessionId: string
): Promise<{ connected: boolean; chatId?: string }> {
  try {
    const response = await fetch("/api/telegram/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      return { connected: false };
    }

    const data = await response.json();
    return {
      connected: data.connected === true,
      chatId: data.chatId,
    };
  } catch (error) {
    console.error("Failed to connect Telegram:", error);
    return { connected: false };
  }
}
