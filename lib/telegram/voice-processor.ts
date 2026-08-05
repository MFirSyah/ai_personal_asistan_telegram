import { processChatRespondDirect } from './chat-processor';
import { generateContentWithFallback } from '@/lib/gemini/client';
import { sendTelegramMessage } from './send-message';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function processVoiceNoteDirect(
  userId: string,
  chatId: number | string,
  voiceFileId: string,
  userName?: string
) {
  if (!TELEGRAM_BOT_TOKEN) return;

  try {
    // 1. Get file path from Telegram API
    const fileRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${voiceFileId}`);
    const fileData = await fileRes.json();

    if (!fileData.ok || !fileData.result?.file_path) {
      throw new Error('Failed to retrieve voice file path from Telegram');
    }

    const voiceUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileData.result.file_path}`;
    const audioArrayBuffer = await fetch(voiceUrl).then((r) => r.arrayBuffer());
    const audioBuffer = Buffer.from(audioArrayBuffer);
    const base64Audio = audioBuffer.toString('base64');

    // 2. Perform Speech-to-Text Transcription via Gemini Audio API
    const prompt = `Transkripsikan rekaman suara pesan suara (voice note) ini ke dalam Bahasa Indonesia secara akurat dan lengkap. Kembalikan HANYA teks transkripsinya saja tanpa tambahan kata pengantar.`;

    const { response } = await generateContentWithFallback(
      [
        {
          inlineData: {
            data: base64Audio,
            mimeType: 'audio/ogg',
          },
        },
        {
          text: prompt,
        },
      ],
      {
        responseMimeType: 'text/plain',
      },
      25_000
    );

    const transcribedText = (response.text || '').trim();

    if (!transcribedText) {
      if (chatId) {
        await sendTelegramMessage(chatId, '⚠️ Maaf, AI tidak dapat mendengar kata-kata dalam rekaman suara tersebut dengan jelas.');
      }
      return;
    }

    if (chatId) {
      await sendTelegramMessage(chatId, `🎙️ **HASIL TRANSKRIPSI SUARA**:\n*"${transcribedText}"*`);
    }

    // 3. Process transcribed text with Gemini Assistant
    await processChatRespondDirect(userId, chatId, transcribedText, userName);
  } catch (error: any) {
    console.error('Error processing voice note:', error);
    if (chatId) {
      await sendTelegramMessage(chatId, 'Maaf, terjadi kesalahan saat memproses pesan suara kamu.');
    }
  }
}
