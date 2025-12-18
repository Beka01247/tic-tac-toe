import { NextRequest, NextResponse } from "next/server";
import { telegramStorage } from "@/lib/telegramStorage";

/**
 * Проверка статуса подключения Telegram
 * GET /api/telegram/status?sessionId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        {
          connected: false,
          error: "sessionId required",
        },
        { status: 400 }
      );
    }

    // Проверяем наличие привязки
    const chatId = await telegramStorage.getChatId(sessionId);
    const connected = chatId !== null;

    return NextResponse.json({
      connected,
      sessionId,
    });
  } catch (error) {
    console.error("[Status] Error:", error);
    return NextResponse.json(
      {
        connected: false,
        error: "Internal error",
      },
      { status: 500 }
    );
  }
}
