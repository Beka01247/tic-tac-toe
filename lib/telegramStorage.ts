/**
 * FILE-BASED STORAGE для Development (персистентный)
 * В production используйте Vercel KV или Upstash Redis
 */

import fs from "fs";
import path from "path";

export interface TelegramStorage {
  setChatId(sessionId: string, chatId: string): Promise<void>;
  getChatId(sessionId: string): Promise<string | null>;
  deleteChatId(sessionId: string): Promise<void>;
}

// Development storage (file-based, сохраняется между перезапусками)
class FileStorage implements TelegramStorage {
  private filePath: string;

  constructor() {
    // Сохраняем в корне проекта в .telegram-sessions.json
    this.filePath = path.join(process.cwd(), ".telegram-sessions.json");
  }

  private async readData(): Promise<Record<string, string>> {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = await fs.promises.readFile(this.filePath, "utf-8");
        return JSON.parse(data);
      }
    } catch (error) {
      console.error("[Storage] Error reading file:", error);
    }
    return {};
  }

  private async writeData(data: Record<string, string>): Promise<void> {
    try {
      await fs.promises.writeFile(
        this.filePath,
        JSON.stringify(data, null, 2),
        "utf-8"
      );
    } catch (error) {
      console.error("[Storage] Error writing file:", error);
    }
  }

  async setChatId(sessionId: string, chatId: string): Promise<void> {
    const data = await this.readData();
    data[sessionId] = chatId;
    await this.writeData(data);
    console.log(`[Storage] Saved: ${sessionId} -> ${chatId}`);
  }

  async getChatId(sessionId: string): Promise<string | null> {
    const data = await this.readData();
    const chatId = data[sessionId] || null;
    console.log(`[Storage] Get: ${sessionId} -> ${chatId}`);
    return chatId;
  }

  async deleteChatId(sessionId: string): Promise<void> {
    const data = await this.readData();
    delete data[sessionId];
    await this.writeData(data);
    console.log(`[Storage] Deleted: ${sessionId}`);
  }
}

// Для production с Vercel KV (раскомментируйте и настройте)
// import { kv } from '@vercel/kv'
//
// class VercelKVStorage implements TelegramStorage {
//   async setChatId(sessionId: string, chatId: string): Promise<void> {
//     await kv.set(`telegram:${sessionId}`, chatId)
//   }
//
//   async getChatId(sessionId: string): Promise<string | null> {
//     return await kv.get<string>(`telegram:${sessionId}`)
//   }
//
//   async deleteChatId(sessionId: string): Promise<void> {
//     await kv.del(`telegram:${sessionId}`)
//   }
// }

// Выбор storage в зависимости от окружения
function getStorage(): TelegramStorage {
  // В production используйте Vercel KV или другой персистентный storage
  // if (process.env.KV_REST_API_URL) {
  //   return new VercelKVStorage()
  // }

  return new FileStorage();
}

export const telegramStorage = getStorage();
