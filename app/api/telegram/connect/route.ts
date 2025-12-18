import { NextRequest, NextResponse } from "next/server";
import { telegramStorage } from "@/lib/telegramStorage";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Альтернативный метод подключения без webhook (для локальной разработки)
 *
 * Использует getUpdates (long polling) вместо webhook
 * Клиент отправляет sessionId, сервер проверяет новые сообщения от бота
 */
export async function POST(request: NextRequest) {
  try {
    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json(
        { ok: false, error: "Bot not configured" },
        { status: 500 }
      );
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { ok: false, error: "sessionId required" },
        { status: 400 }
      );
    }

    // Проверяем, может уже подключено
    const existingChatId = await telegramStorage.getChatId(sessionId);
    if (existingChatId) {
      return NextResponse.json({
        ok: true,
        connected: true,
        chatId: existingChatId,
      });
    }

    // Получаем новые обновления от Telegram
    const updates = await getTelegramUpdates();

    // Ищем команду /start с нашим sessionId
    for (const update of updates) {
      const text = update.message?.text;
      if (!text?.startsWith("/start")) continue;

      const parts = text.split(" ");
      const receivedSessionId = parts[1];

      if (receivedSessionId === sessionId) {
        const chatId = update.message.chat.id.toString();

        console.log(
          `[Connect] Found matching session! ${sessionId} -> ${chatId}`
        );

        // Сохраняем привязку в storage (для локальной разработки)
        await telegramStorage.setChatId(sessionId, chatId);

        // Отправляем подтверждение
        await sendTelegramMessage(
          chatId,
          "✅ Telegram успешно подключён!\n\n" +
            'Теперь вы будете получать уведомления о победах и проигрышах в игре "Крестики-нолики".'
        );

        console.log(
          `[Connect] Successfully connected: session ${sessionId} -> chat ${chatId}`
        );

        // Возвращаем chatId клиенту для сохранения в localStorage
        return NextResponse.json({
          ok: true,
          connected: true,
          chatId,
        });
      }
    }

    // Не нашли подходящую команду /start
    return NextResponse.json({
      ok: true,
      connected: false,
      message: "Waiting for /start command in Telegram",
    });
  } catch (error) {
    console.error("[Connect] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Получить обновления от Telegram (getUpdates)
async function getTelegramUpdates(): Promise<any[]> {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?timeout=1&limit=100`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();

      // Если ошибка 409 (Conflict) - webhook установлен
      if (response.status === 409) {
        console.log(
          "[Connect] Webhook conflict detected, attempting to delete..."
        );
        await deleteWebhook();

        // Повторная попытка после удаления webhook
        const retryResponse = await fetch(url);
        if (retryResponse.ok) {
          const data = await retryResponse.json();
          return data.result || [];
        }
      }

      throw new Error(
        `Telegram API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.error("[Connect] Failed to get updates:", error);
    return [];
  }
}

// Удалить webhook
async function deleteWebhook(): Promise<void> {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook?drop_pending_updates=true`;

  try {
    const response = await fetch(url, { method: "POST" });
    const data = await response.json();

    if (data.ok) {
      console.log("[Connect] Webhook deleted successfully");
    } else {
      console.error("[Connect] Failed to delete webhook:", data);
    }
  } catch (error) {
    console.error("[Connect] Error deleting webhook:", error);
  }
}

// Отправить сообщение в Telegram
async function sendTelegramMessage(
  chatId: string,
  text: string
): Promise<void> {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("[Connect] Failed to send message:", error);
  }
}
