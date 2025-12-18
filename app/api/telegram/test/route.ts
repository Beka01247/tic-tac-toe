import { NextRequest, NextResponse } from "next/server";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Тестовый endpoint для проверки Telegram API
 * GET /api/telegram/test - получить статус бота
 */
export async function GET(request: NextRequest) {
  if (!TELEGRAM_BOT_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "TELEGRAM_BOT_TOKEN not configured" },
      { status: 500 }
    );
  }

  try {
    // Получить информацию о боте
    const meResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`
    );
    const meData = await meResponse.json();

    // Получить информацию о webhook
    const webhookResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`
    );
    const webhookData = await webhookResponse.json();

    // Попробовать получить обновления
    const updatesResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?limit=1`
    );
    const updatesData = await updatesResponse.json();

    return NextResponse.json({
      ok: true,
      bot: meData.result,
      webhook: webhookData.result,
      canGetUpdates: updatesData.ok,
      updatesError: updatesData.ok ? null : updatesData.description,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/telegram/test - удалить webhook и сбросить pending updates
 */
export async function DELETE(request: NextRequest) {
  if (!TELEGRAM_BOT_TOKEN) {
    return NextResponse.json(
      { ok: false, error: "TELEGRAM_BOT_TOKEN not configured" },
      { status: 500 }
    );
  }

  try {
    // Удалить webhook с очисткой pending updates
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook?drop_pending_updates=true`,
      { method: "POST" }
    );

    const data = await response.json();

    return NextResponse.json({
      ok: data.ok,
      message: "Webhook deleted, pending updates dropped",
      result: data.result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
