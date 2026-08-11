const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export async function sendTelegramChatAction(
  chatId: number | string,
  action: 'typing' | 'upload_photo' | 'find_location' = 'typing'
): Promise<any> {
  if (!TELEGRAM_BOT_TOKEN) return { ok: true };

  const url = `${TELEGRAM_API_BASE}/sendChatAction`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, action }),
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to send Telegram chat action:', error);
    return null;
  }
}

/**
 * Registers bot command autocomplete menu with Telegram API
 */
export async function setTelegramBotCommands(): Promise<any> {
  if (!TELEGRAM_BOT_TOKEN) return { ok: true };

  const url = `${TELEGRAM_API_BASE}/setMyCommands`;
  const commands = [
    { command: 'start', description: 'Mulai & status akun kamu' },
    { command: 'ringkasan', description: 'Laporan ringkas pengeluaran & saldo' },
    { command: 'dashboard', description: 'Buka Mini App Dashboard interaktif' },
    { command: 'pasangan', description: 'Hubungkan akun dengan pasangan' },
    { command: 'split', description: 'Kalkulator patungan tagihan (Split Bill)' },
    { command: 'export', description: 'Export data keuangan/aktivitas ke Excel/CSV' },
    { command: 'pdf', description: 'Cetak Laporan Eksklusif Bulanan ke PDF/Doc' },
    { command: 'langganan', description: 'Daftar tagihan langganan rutin' },
    { command: 'utang', description: 'Daftar catatan utang & piutang' },
    { command: 'lunas_semua_utang', description: 'Batch update: Tandai semua utang lunas' },
    { command: 'selesaikan_semua_aktivitas', description: 'Batch update: Tandai semua aktivitas selesai' },
    { command: 'acak_jam', description: 'Batch update: Set tanggal ke hari ini & acak jam' },
    { command: 'habit', description: 'Statistik habit tracker & streak' },
    { command: 'nama', description: 'Lihat & ubah nama panggilan AI kamu' },
    { command: 'briefing', description: 'Atur jam morning briefing harian' },
    { command: 'preferensi', description: 'Lihat pola & gaya bahasa yang dipelajari AI' },
    { command: 'bantuan', description: 'Panduan lengkap & daftar perintah bot' },
    { command: 'hapus_semua', description: 'Hapus semua data (dengan konfirmasi)' },
  ];

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands }),
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to set Telegram commands:', err);
    return null;
  }
}

function sanitizeMarkdown(text: string): string {
  const openAsterisks = (text.match(/\*/g) || []).length % 2 !== 0;
  const openUnderscores = (text.match(/_/g) || []).length % 2 !== 0;
  const openBackticks = (text.match(/`/g) || []).length % 2 !== 0;

  if (openAsterisks || openUnderscores || openBackticks) {
    return text.replace(/[*_`]/g, '');
  }
  return text;
}

export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  replyMarkup?: any,
  parseMode: 'Markdown' | 'HTML' | null = 'Markdown'
): Promise<any> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn(`[TELEGRAM MOCK] sendTo ${chatId}: ${text}`);
    return { ok: true, mock: true };
  }

  const url = `${TELEGRAM_API_BASE}/sendMessage`;
  const sanitizedText = parseMode === 'Markdown' ? sanitizeMarkdown(text) : text;

  const body: any = {
    chat_id: chatId,
    text: sanitizedText,
  };

  if (parseMode) {
    body.parse_mode = parseMode;
  }

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

    if (!data.ok && data.description && data.description.includes('can\'t parse entities')) {
      console.warn('Telegram Markdown parse error, retrying as plain text...');
      const fallbackBody = { ...body, text, parse_mode: undefined };
      const retryRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fallbackBody),
      });
      return await retryRes.json();
    }

    return data;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return null;
  }
}

export async function sendTelegramMessageBubbles(
  chatId: number | string,
  messages: string[],
  delayMs = 150,
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

export async function sendTelegramDocument(
  chatId: number | string,
  fileBuffer: Buffer | Uint8Array,
  filename: string,
  caption?: string,
  mimeType?: string
): Promise<any> {
  if (!TELEGRAM_BOT_TOKEN) return { ok: true, mock: true };

  let detectedMime = mimeType;
  if (!detectedMime) {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') detectedMime = 'application/pdf';
    else if (ext === 'csv') detectedMime = 'text/csv';
    else if (ext === 'ics') detectedMime = 'text/calendar';
    else detectedMime = 'application/octet-stream';
  }

  const url = `${TELEGRAM_API_BASE}/sendDocument`;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const formData = new FormData();
      formData.append('chat_id', String(chatId));

      const blob = new Blob([Buffer.from(fileBuffer)], { type: detectedMime });
      formData.append('document', blob, filename);

      if (caption) {
        formData.append('caption', caption);
      }

      const res = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.ok) return data;

      console.warn(`Telegram sendDocument attempt ${attempt} failed:`, data.description);
    } catch (error) {
      console.error(`Telegram sendDocument error (attempt ${attempt}):`, error);
    }
  }

  return null;
}
