import { NextRequest } from 'next/server';

export function verifyTelegramWebhook(req: NextRequest): boolean {
  const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secretToken) return true; // Bypass in dev if secret not set

  const headerSecret = req.headers.get('x-telegram-bot-api-secret-token');
  return headerSecret === secretToken;
}
