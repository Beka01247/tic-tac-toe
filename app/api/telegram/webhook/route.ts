import { NextRequest, NextResponse } from "next/server";
import { telegramStorage } from "@/lib/telegramStorage";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Webhook для получения обновлений от Telegram бота
 *
 * Настройка webhook:
 * curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
 *   -H "Content-Type: application/json" \
 *   -d '{"url": "https://your-domain.com/api/telegram/webhook"}'
 */
export async function POST(request: NextRequest) {
  try {
    // Базовая валидация токена (опционально)
    const secretToken = request.headers.get("x-telegram-bot-api-secret-token");
    // Можно добавить проверку: if (secretToken !== process.env.TELEGRAM_WEBHOOK_SECRET) { ... }

    if (!TELEGRAM_BOT_TOKEN) {
      console.error("TELEGRAM_BOT_TOKEN not configured");
      return NextResponse.json(
        { ok: false, error: "Bot not configured" },
        { status: 500 }
      );
    }

    const update = await request.json();
    console.log("[Webhook] Received update:", JSON.stringify(update, null, 2));

    // Обработка команды /start
    if (update.message?.text?.startsWith("/start")) {
      const chatId = update.message.chat.id.toString();
      const text = update.message.text;

      // Извлекаем sessionId из команды: /start session_xxxxx
      const parts = text.split(" ");
      const sessionId = parts[1];

      if (!sessionId) {
        // Просто /start без параметров - отправляем инструкцию
        await sendTelegramMessage(
          chatId,
          "👋 Привет! Для получения уведомлений о игре:\n\n" +
            "1. Откройте игру в браузере\n" +
            '2. Нажмите кнопку "Подключить Telegram"\n' +
            "3. Вернитесь сюда автоматически"
        );
        return NextResponse.json({ ok: true, message: "Instructions sent" });
      }

      // Сохраняем привязку sessionId -> chatId
      await telegramStorage.setChatId(sessionId, chatId);

      // Отправляем подтверждение
      await sendTelegramMessage(
        chatId,
        "✅ Telegram успешно подключён!\n\n" +
          'Теперь вы будете получать уведомления о победах и проигрышах в игре "Крестики-нолики".'
      );

      console.log(
        `[Webhook] Connected: session ${sessionId} -> chat ${chatId}`
      );

      return NextResponse.json({ ok: true, message: "Connection established" });
    }

    // Другие типы обновлений (игнорируем)
    return NextResponse.json({ ok: true, message: "Update ignored" });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Вспомогательная функция отправки сообщения
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
    console.error("[Webhook] Failed to send message:", error);
    throw new Error("Failed to send Telegram message");
  }
}
