
export function splitLongText(text: string, maxLen = 4000): string[] {
  if (!text || text.length <= maxLen) return [text];
  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }
    let splitIdx = remaining.lastIndexOf('\n\n', maxLen);
    if (splitIdx === -1 || splitIdx < maxLen * 0.4) {
      splitIdx = remaining.lastIndexOf('\n', maxLen);
    }
    if (splitIdx === -1 || splitIdx < maxLen * 0.4) {
      splitIdx = remaining.lastIndexOf(' ', maxLen);
    }
    if (splitIdx === -1) {
      splitIdx = maxLen;
    }
    chunks.push(remaining.substring(0, splitIdx).trim());
    remaining = remaining.substring(splitIdx).trim();
  }
  return chunks.filter(c => c.length > 0);
}

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
  if (!text) return '';

  let sanitized = text;

  // Auto-balance odd asterisks count so bold formatting isn't ruined
  const asterisks = (sanitized.match(/\*/g) || []).length;
  if (asterisks % 2 !== 0) {
    sanitized += '*';
  }

  // Auto-balance odd underscores count
  const underscores = (sanitized.match(/_/g) || []).length;
  if (underscores % 2 !== 0) {
    sanitized += '_';
  }

  // Auto-balance odd backticks count
  const backticks = (sanitized.match(/`/g) || []).length;
  if (backticks % 2 !== 0) {
    sanitized += '`';
  }

  return sanitized;
}

export function markdownToTelegramHtml(text: string): string {
  if (!text) return '';

  let html = text;

  // Escape HTML entities to prevent Telegram parse errors
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Convert markdown links [text](url) -> <a href="url">text</a>
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g, (match, linkText, url) => {
    const cleanUrl = url.replace(/&amp;/g, '&');
    return `<a href="${cleanUrl}">${linkText}</a>`;
  });

  // Convert **bold** or __bold__ -> <b>bold</b>
  html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  html = html.replace(/__(.*?)__/g, '<b>$1</b>');

  // Convert `code` -> <code>code</code>
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  return html;
}

export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  replyMarkup?: any,
  parseMode: 'Markdown' | 'HTML' | null = 'HTML'
): Promise<any> {
  if (!text) return { ok: true };

  // Auto-chunk messages longer than 4000 characters
  if (text.length > 4000) {
    const chunks = splitLongText(text, 3900);
    let lastResult: any = { ok: true };
    for (let i = 0; i < chunks.length; i++) {
      const isLast = i === chunks.length - 1;
      lastResult = await sendTelegramMessage(chatId, chunks[i], isLast ? replyMarkup : undefined, parseMode);
      if (!isLast) await new Promise((r) => setTimeout(r, 150));
    }
    return lastResult;
  }

  if (!TELEGRAM_BOT_TOKEN) {
    console.warn(`[TELEGRAM MOCK] sendTo ${chatId}: ${text}`);
    return { ok: true, mock: true };
  }

  const url = `${TELEGRAM_API_BASE}/sendMessage`;
  const formattedText = parseMode === 'HTML' ? markdownToTelegramHtml(text) : parseMode === 'Markdown' ? sanitizeMarkdown(text) : text;

  const body: any = {
    chat_id: chatId,
    text: formattedText,
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

    if (!data.ok && data.description && (data.description.includes("can't parse entities") || data.description.includes('find end of the entity'))) {
      console.warn('Telegram Markdown parse error, retrying as plain text...');
      const cleanText = text.replace(/[*_`]/g, '');
      const fallbackBody = { ...body, text: cleanText, parse_mode: undefined };
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
