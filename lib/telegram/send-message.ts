const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  replyMarkup?: any,
  parseMode: 'Markdown' | 'HTML' = 'Markdown'
): Promise<any> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn(`[TELEGRAM MOCK] sendTo ${chatId}: ${text}`);
    return { ok: true, mock: true };
  }

  const url = `${TELEGRAM_API_BASE}/sendMessage`;
  const body: any = {
    chat_id: chatId,
    text,
    parse_mode: parseMode,
  };

  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return null;
  }
}

export async function sendTelegramMessageBubbles(
  chatId: number | string,
  messages: string[],
  delayMs = 1200,
  replyMarkupLastMessage?: any
): Promise<void> {
  for (let i = 0; i < messages.length; i++) {
    const isLast = i === messages.length - 1;
    const markup = isLast ? replyMarkupLastMessage : undefined;

    await sendTelegramMessage(chatId, messages[i], markup);

    if (!isLast && delayMs > 0) {
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}
