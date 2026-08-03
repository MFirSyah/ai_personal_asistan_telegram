import { processChatRespondDirect } from './chat-processor';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function processVoiceNoteDirect(
  userId: string,
  chatId: number | string,
  voiceFileId: string,
  userName?: string
) {
  if (!TELEGRAM_BOT_TOKEN) return;

  try {
    // 1. Get file path from Telegram
    const fileRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${voiceFileId}`);
    const fileData = await fileRes.json();

    if (!fileData.ok || !fileData.result?.file_path) {
      throw new Error('Failed to retrieve voice file path from Telegram');
    }

    const voiceUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileData.result.file_path}`;

    // For now, inform user that voice note is received and fallback to audio processing
    const promptText = `Pesan suara diterima. Tolong analisis pengeluaran atau aktivitas dari rekaman suara ini.`;

    await processChatRespondDirect(userId, chatId, promptText, userName);
  } catch (error: any) {
    console.error('Error processing voice note:', error);
  }
}
