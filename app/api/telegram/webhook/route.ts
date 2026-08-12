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

    if (data === 'confirm_delete_all') {
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

  // 6. Use Next.js after() to execute background task in Vercel serverless without termination
  after(async () => {
    const voice = message.voice;
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
        user.name || message.from.first_name
      );
    }
  });

  // Return HTTP 200 OK immediately to Telegram (<30ms)
  return NextResponse.json({ ok: true });
}
