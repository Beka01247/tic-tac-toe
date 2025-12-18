import { getOrCreateSessionId } from "./telegramSession";

export async function sendTelegramNotification(
  result: "win" | "loss",
  promoCode?: string
): Promise<{ success: boolean; error?: string; code?: string }> {
  try {
    // Получить sessionId из localStorage
    const sessionId = getOrCreateSessionId();

    const response = await fetch("/api/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ result, promoCode, sessionId }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Если Telegram не подключён, возвращаем специальный код
      if (data.code === "TELEGRAM_NOT_CONNECTED") {
        return {
          success: false,
          code: "TELEGRAM_NOT_CONNECTED",
          error: data.message || "Telegram не подключён",
        };
      }

      throw new Error(data.error || "Failed to send notification");
    }

    return { success: true };
  } catch (error) {
    console.error("Telegram notification error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
