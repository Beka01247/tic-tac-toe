import { NextRequest, NextResponse } from "next/server";
import { telegramStorage } from "@/lib/telegramStorage";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID; // Опциональный fallback

export async function POST(request: NextRequest) {
  try {
    // Validate bot token
    if (!TELEGRAM_BOT_TOKEN) {
      console.error("TELEGRAM_BOT_TOKEN not configured");
      return NextResponse.json(
        {
          error:
            "Telegram бот не настроен. Добавьте TELEGRAM_BOT_TOKEN в .env.local",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { result, promoCode, sessionId, chatId: clientChatId } = body;

    if (!result || !["win", "loss"].includes(result)) {
      return NextResponse.json(
        { error: "Invalid result parameter" },
        { status: 400 }
      );
    }

    // Определяем chat_id
    let chatId: string | null = null;

    console.log("[Notify] Received request:", {
      result,
      promoCode,
      sessionId,
      clientChatId,
    });

    // 1. Используем chatId из клиента (localStorage) - для Vercel
    if (clientChatId) {
      chatId = clientChatId;
      console.log("[Notify] Chat ID from client:", chatId);
    }

    // 2. Пытаемся получить chat_id из sessionId (для локальной разработки)
    if (!chatId && sessionId) {
      chatId = await telegramStorage.getChatId(sessionId);
      console.log("[Notify] Chat ID from storage:", chatId);
    }

    // 3. Fallback на env переменную (для владельца/demo)
    if (!chatId && TELEGRAM_CHAT_ID) {
      chatId = TELEGRAM_CHAT_ID;
      console.log("[Notify] Using fallback TELEGRAM_CHAT_ID from env");
    }

    // 3. Если chat_id не найден - возвращаем ошибку
    if (!chatId) {
      console.log("[Notify] No chat_id found for sessionId:", sessionId);
      return NextResponse.json(
        {
          error: "Telegram не подключён",
          code: "TELEGRAM_NOT_CONNECTED",
          message: "Подключите Telegram, чтобы получать уведомления",
        },
        { status: 409 }
      );
    }

    // Compose message
    let message = "";
    if (result === "win") {
      if (!promoCode) {
        return NextResponse.json(
          { error: "Promo code required for win" },
          { status: 400 }
        );
      }
      message = `🎉 Победа! Промокод выдан: ${promoCode}`;
    } else if (result === "loss") {
      message = "😔 Проигрыш";
    }

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Notify] Telegram API error:", data);
      return NextResponse.json(
        { error: "Failed to send Telegram message", details: data },
        { status: 500 }
      );
    }

    console.log("[Notify] Message sent successfully to chat:", chatId);
    return NextResponse.json({ success: true, message, chatId });
  } catch (error) {
    console.error("Error in /api/notify:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
