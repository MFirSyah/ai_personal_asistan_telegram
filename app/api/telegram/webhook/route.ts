
// Idempotency cache to prevent duplicate processing on Telegram webhook retries
const processedUpdates = new Map<number, number>();

function isDuplicateUpdate(updateId?: number): boolean {
  if (!updateId) return false;
  const now = Date.now();
  for (const [id, time] of processedUpdates.entries()) {
    if (now - time > 5 * 60 * 1000) {
      processedUpdates.delete(id);
    }
  }
  if (processedUpdates.has(updateId)) {
    return true;
  }
  processedUpdates.set(updateId, now);
  return false;
}

import { NextRequest, NextResponse, after } from 'next/server';
import { verifyTelegramWebhook } from '@/lib/telegram/verify-webhook';
import { getUserByTelegramId, touchOrStartSession } from '@/lib/supabase/queries/sessions';
import { checkAndUpdateRateLimit } from '@/lib/gemini/rate-limiter';
import { sendTelegramMessage, sendTelegramChatAction, setTelegramBotCommands } from '@/lib/telegram/send-message';
import { buildDashboardInlineKeyboard } from '@/lib/telegram/inline-keyboard';
import { processChatRespondDirect } from '@/lib/telegram/chat-processor';
import { processReceiptDirect } from '@/lib/telegram/receipt-processor';
import { processVoiceNoteDirect } from '@/lib/telegram/voice-processor';
import { supabaseAdmin } from '@/lib/supabase/client';
import { handleFinancialCommands } from '@/lib/telegram/commands/financial-commands';
import { handleTaskCommands } from '@/lib/telegram/commands/task-commands';
import { handleSystemCommands } from '@/lib/telegram/commands/system-commands';

export async function POST(req: NextRequest) {
  if (!verifyTelegramWebhook(req)) {
    return NextResponse.json({ error: 'Unauthorized webhook request' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  // Idempotency check: Ignore duplicate updates from Telegram retry
  if (isDuplicateUpdate(body.update_id)) {
    console.log(`[Telegram Webhook] Duplicate update ${body.update_id} ignored.`);
    return NextResponse.json({ ok: true });
  }

  // Handle Callback Queries (e.g. inline confirmation buttons)
  if (body.callback_query) {
    const cb = body.callback_query;
    const fromId = cb.from.id;
    const data = cb.data;

    const user = await getUserByTelegramId(fromId);
    if (!user) {
      await sendTelegramMessage(fromId, '🚫 Akses ditolak. Akun Telegram kamu belum terhubung dengan akun Supabase resmi.');
      return NextResponse.json({ ok: true });
    }

    // Instant Haptic Answer to Telegram Callback Query
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken && cb.id) {
      fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: cb.id }),
      }).catch(() => {});
    }

    if (data === 'qa_saldo') {
      await processChatRespondDirect(user.id, fromId, 'tampilkan ringkasan saldo semua dompet saya', user.name || 'User');
    } else if (data === 'qa_dieng') {
      await processChatRespondDirect(user.id, fromId, 'rincian plan trip dieng dan progres tabunganku', user.name || 'User');
    } else if (data === 'qa_laporan') {
      await handleFinancialCommands('/ringkasan', fromId, user, fromId);
    } else if (data === 'chip_bensin') {
      await processChatRespondDirect(user.id, fromId, 'catat pengeluaran bensin 25rb pake cash', user.name || 'User');
    } else if (data === 'chip_makan') {
      await processChatRespondDirect(user.id, fromId, 'catat makan siang 20rb', user.name || 'User');
    } else if (data === 'chip_parkir') {
      await processChatRespondDirect(user.id, fromId, 'catat bayar parkir 2000 cash', user.name || 'User');
    } else if (data === 'chip_gojek') {
      await processChatRespondDirect(user.id, fromId, 'tampilkan evaluasi performa narik gojek dan efisiensi bensin', user.name || 'User');
    } else if (data === 'chip_sinking') {
      await processChatRespondDirect(user.id, fromId, 'hitung simulasi sinking fund pajak stnk motor tahunan dan dana darurat', user.name || 'User');
    } else if (data === 'chip_pelunasan') {
      await processChatRespondDirect(user.id, fromId, 'hitung simulasi penghematan bunga jika melunasi cicilan pinjaman bank jago lebih cepat', user.name || 'User');
    } else if (data.startsWith('setwallet_')) {
      const parts = data.split('_');
      const walletKey = parts[parts.length - 1];
      const targetTxId = parts[1] === 'latest' ? null : parts[1];

      const walletNames: Record<string, string> = {
        cash: 'Cash Kertas',
        gopay: 'Gopay',
        seabank: 'SeaBank',
        jago: 'Bank Jago',
      };
      const chosenWallet = walletNames[walletKey] || 'Cash Kertas';

      try {
        let query = supabaseAdmin.from('transactions').select('id, description, amount').eq('user_id', user.id).is('deleted_at', null);
        if (targetTxId) {
          query = query.eq('id', targetTxId);
        } else {
          query = query.order('created_at', { ascending: false }).limit(1);
        }
        const { data: foundTxs } = await query;
        if (foundTxs && foundTxs.length > 0) {
          const tx = foundTxs[0];
          await supabaseAdmin.from('transactions').update({ payment_method: chosenWallet }).eq('id', tx.id);
          await sendTelegramMessage(
            fromId,
            `✅ **METODE PEMBAYARAN DIPERBARUI!**\n\nTransaksi **${tx.description || 'Pengeluaran'}** sebesar **Rp ${Number(tx.amount).toLocaleString('id-ID')}** kini resmi dialokasikan ke dompet **${chosenWallet}**.`
          );
        } else {
          await sendTelegramMessage(fromId, `✅ Pilihan dompet **${chosenWallet}** telah dicatat.`);
        }
      } catch (wErr) {
        console.error('Error updating wallet method:', wErr);
        await sendTelegramMessage(fromId, `✅ Pilihan dompet **${chosenWallet}** telah dicatat.`);
      }
    } else if (data === 'confirm_delete_all') {
      const nowIso = new Date().toISOString();
      await Promise.all([
        supabaseAdmin.from('transactions').update({ deleted_at: nowIso }).eq('user_id', user.id).is('deleted_at', null),
        supabaseAdmin.from('activities').update({ deleted_at: nowIso }).eq('user_id', user.id).is('deleted_at', null),
        supabaseAdmin.from('plans').update({ status: 'cancelled' }).eq('user_id', user.id),
      ]);

      await sendTelegramMessage(
        fromId,
        '🗑️ **SEMUA DATA BERHASIL DIHAPUS!**\n\nSeluruh catatan transaksi, aktivitas, dan rencana kamu telah dibersihkan. Sekarang database kamu sudah bersih kembali 100%!'
      );
    } else if (data === 'cancel') {
      await sendTelegramMessage(fromId, '❌ Tindakan dibatalkan.');
    } else if (data.startsWith('act_complete_')) {
      const actId = data.replace('act_complete_', '');
      await supabaseAdmin.from('activities').update({ status: 'completed' }).eq('id', actId).eq('user_id', user.id);
      await sendTelegramMessage(fromId, '✅ **AGENDA TERSEBUT TELAH DITANDAI SELESAI!**\n\nAnalisis & laporan ringkasan kamu otomatis diperbarui 100%.');
    } else if (data.startsWith('act_in_progress_')) {
      const actId = data.replace('act_in_progress_', '');
      await supabaseAdmin.from('activities').update({ status: 'in_progress' }).eq('id', actId).eq('user_id', user.id);
      await sendTelegramMessage(fromId, '⏳ **AGENDA DICATAT SEDANG BERLANGSUNG.**\n\nSemangat menyelesaikan agendamu!');
    }

    return NextResponse.json({ ok: true });
  }

  const message = body.message;
  if (!message || !message.from) {
    return NextResponse.json({ ok: true });
  }

  const chatId = message.chat.id;
  const telegramId = message.from.id;
  const text = (message.text || '').trim();
  const photo = message.photo;

  // 1. Identify User — STRICT SECURITY CHECK
  const user = await getUserByTelegramId(telegramId);
  if (!user) {
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-personal-asistan-telegram.vercel.app';
    const loginUrl = `${appBaseUrl}/dashboard/login?telegram_id=${telegramId}`;

    await sendTelegramMessage(
      chatId,
      `🔒 **AKSES DITOLAK (AKUN BELUM TERHUBUNG)**\n\nHalo ${message.from.first_name || 'Teman'}!\nBot Asisten ini bersifat **privat**. Akun Telegram kamu (${telegramId}) belum terdaftar di sistem.\n\nJika kamu adalah pengguna resmi, silakan login dengan Email & Password Supabase kamu melalui tombol di bawah untuk menghubungkan akun Telegram ini:`,
      {
        inline_keyboard: [[{ text: '🔑 Login & Hubungkan Akun', url: loginUrl }]],
      }
    );
    return NextResponse.json({ ok: true });
  }

  // 2. Check Session (3 days expiration)
  try {
    await touchOrStartSession(user.id);
  } catch (err) {
    await sendTelegramMessage(chatId, 'Sesi kamu telah berakhir. Silakan login ulang.');
    return NextResponse.json({ ok: true });
  }

  // 3. Command Handlers
  if (text.startsWith('/start')) {
    setTelegramBotCommands().catch(console.error);

    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-personal-asistan-telegram.vercel.app';
    await sendTelegramMessage(
      chatId,
      `Selamat datang kembali, ${user.name || 'Teman'}! 👋\nSaya adalah Asisten Keuangan & Aktivitas Personal kamu.\n\nKamu bisa langsung mencatat pengeluaran, foto struk, kirim cerita/agenda, atau gunakan perintah berikut:\n- /ringkasan : Rekap keuangan cepat\n- /dashboard : Mini App interaktif\n- /progress : Status pekerjaan background\n- /preferensi : Gaya bahasa & pola AI\n- /briefing : Pengaturan jam pengingat\n- /bantuan : Panduan penggunaan`,
      buildDashboardInlineKeyboard(`${appBaseUrl}/dashboard?telegram_id=${telegramId}`)
    );
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith('/dashboard')) {
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-personal-asistan-telegram.vercel.app';
    await sendTelegramMessage(
      chatId,
      'Klik tombol di bawah untuk membuka Telegram Mini App Dashboard kamu:',
      buildDashboardInlineKeyboard(`${appBaseUrl}/dashboard?telegram_id=${telegramId}`)
    );
    return NextResponse.json({ ok: true });
  }

  // Delegate Financial Commands
  const financialResult = await handleFinancialCommands(text, chatId, user, telegramId);
  if (financialResult) return financialResult;

  // Delegate Task Commands
  const taskResult = await handleTaskCommands(text, chatId, user);
  if (taskResult) return taskResult;

  // Delegate System Commands
  const systemResult = await handleSystemCommands(text, chatId, user);
  if (systemResult) return systemResult;

  // 4. Rate Limiting Check
  const rateCheck = await checkAndUpdateRateLimit(user.id);
  if (!rateCheck.allowed) {
    if (rateCheck.reason === 'minute_limit_exceeded') {
      await sendTelegramMessage(
        chatId,
        `⏳ Terlalu banyak pesan dalam waktu singkat. Tolong tunggu sekitar ${rateCheck.retryAfterSeconds || 10} detik ya.`
      );
    } else {
      await sendTelegramMessage(
        chatId,
        '🛑 Kamu telah mencapai batas maksimum request harian (700 request/hari). Silakan lanjutkan percakapan besok ya!'
      );
    }
    return NextResponse.json({ ok: true });
  }

  // 5. Send typing indicator immediately (<30ms)
  sendTelegramChatAction(chatId, photo ? 'upload_photo' : 'typing').catch(console.error);

  // 6. Direct Reliable Dispatch: Ensure message is delivered before Vercel serverless terminates
  const voice = message.voice;
  try {
    if (photo && photo.length > 0) {
      const largestPhoto = photo[photo.length - 1];
      await processReceiptDirect(user.id, chatId, largestPhoto.file_id);
    } else if (voice && voice.file_id) {
      await processVoiceNoteDirect(user.id, chatId, voice.file_id, user.name || message.from.first_name);
    } else {
      await processChatRespondDirect(
        user.id,
        chatId,
        text,
        user.name || message.from.first_name,
        message.date ? message.date * 1000 : undefined
      );
    }
  } catch (procErr) {
    console.error('[Webhook Dispatch Error]', procErr);
    await sendTelegramMessage(chatId, 'Maaf Mas Firman, server baru saja terbangun dari standby. Silakan kirim ulang pesan Anda ya!');
  }

  // Return HTTP 200 OK to Telegram
  return NextResponse.json({ ok: true });
}
