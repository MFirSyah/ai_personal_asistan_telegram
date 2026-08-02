import { processReceiptImage } from '@/lib/gemini/prompts/ocr-receipt';
import { insertTransaction } from '@/lib/supabase/queries/transactions';
import { getOrCreateCategory } from '@/lib/supabase/queries/categories';
import { sendTelegramMessage } from '@/lib/telegram/send-message';

export async function processReceiptDirect(
  userId: string,
  chatId: number | string,
  fileId: string
) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      if (chatId) {
        await sendTelegramMessage(chatId, '⚙️ Telegram Bot Token belum dikonfigurasi.');
      }
      return;
    }

    // 1. Fetch file path from Telegram API
    const getFileUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`;
    const fileRes = await fetch(getFileUrl).then((r) => r.json());

    if (!fileRes.ok || !fileRes.result?.file_path) {
      if (chatId) {
        await sendTelegramMessage(chatId, '❌ Gagal mengunduh gambar dari Telegram.');
      }
      return;
    }

    const filePath = fileRes.result.file_path;
    const downloadUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;

    const imageArrayBuffer = await fetch(downloadUrl).then((r) => r.arrayBuffer());
    const imageBuffer = Buffer.from(imageArrayBuffer);

    // 2. Process image with Gemini Vision OCR
    const ocrResult = await processReceiptImage(imageBuffer, 'image/jpeg');

    // 3. Get or Create Category
    const categoryName = ocrResult.merchant || 'Struk Belanja';
    const category = await getOrCreateCategory(userId, categoryName);

    // 4. Save transaction
    const tx = await insertTransaction({
      user_id: userId,
      category_id: category.id,
      amount: ocrResult.totalAmount,
      type: 'expense',
      merchant: ocrResult.merchant,
      description: `OCR Struk: ${ocrResult.items.map((i) => `${i.name} (x${i.quantity || 1})`).join(', ')}`,
      source: 'receipt_ocr',
      raw_ai_response: ocrResult.rawResponse,
      occurred_at: ocrResult.date || new Date().toISOString(),
    });

    // 5. Notify User via Telegram
    if (chatId) {
      let msg = `🧾 **STRUK BERHASIL DIBACA** ✅\n\n`;
      msg += `📍 **Merchant**: ${ocrResult.merchant}\n`;
      msg += `💰 **Total**: Rp ${ocrResult.totalAmount.toLocaleString('id-ID')}\n`;
      msg += `🏷️ **Kategori**: ${category.name}\n`;

      if (ocrResult.items.length > 0) {
        msg += `\n📦 **Daftar Barang**:\n`;
        ocrResult.items.forEach((item) => {
          msg += `- ${item.name}: Rp ${Number(item.price || 0).toLocaleString('id-ID')}\n`;
        });
      }

      if (ocrResult.needs_review) {
        msg += `\n⚠️ *Catatan: Total nominal struk mungkin membutuhkan verifikasi ulang.*`;
      }

      await sendTelegramMessage(chatId, msg);
    }

    return tx;
  } catch (error: any) {
    console.error('Error processing receipt in-memory:', error);
    if (chatId) {
      await sendTelegramMessage(chatId, 'Maaf, terjadi kesalahan saat membaca gambar struk kamu.');
    }
  }
}
