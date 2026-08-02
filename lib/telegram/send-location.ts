const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export async function sendTelegramLocation(
  chatId: number | string,
  latitude: number,
  longitude: number
): Promise<any> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn(`[TELEGRAM MOCK LOCATION] sendTo ${chatId}: lat=${latitude}, lng=${longitude}`);
    return { ok: true, mock: true };
  }

  const url = `${TELEGRAM_API_BASE}/sendLocation`;
  const body = {
    chat_id: chatId,
    latitude,
    longitude,
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to send Telegram location:', error);
    return null;
  }
}
