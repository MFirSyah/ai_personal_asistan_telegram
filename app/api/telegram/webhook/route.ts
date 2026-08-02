import { NextRequest, NextResponse } from 'next/server';
import { verifyTelegramWebhook } from '@/lib/telegram/verify-webhook';
import { getUserByTelegramId, touchOrStartSession } from '@/lib/supabase/queries/sessions';
import { checkAndUpdateRateLimit } from '@/lib/gemini/rate-limiter';
import { sendTelegramMessage } from '@/lib/telegram/send-message';
import { buildConfirmationInlineKeyboard, buildDashboardInlineKeyboard } from '@/lib/telegram/inline-keyboard';
import { scheduleBatchJob } from '@/lib/jobs/create-job';

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
      await sendTelegramMessage(fromId, 'Akun kamu belum terhubung. Silakan gunakan link login.');
      return NextResponse.json({ ok: true });
    }

    if (data === 'confirm_delete_all') {
      await scheduleBatchJob(user.id, 'delete_all', 100);
      await sendTelegramMessage(
        fromId,
        '⏳ Permintaan hapus data telah dikonfirmasi dan sedang diproses di background. Kamu akan mendapat notifikasi setelah selesai.'
      );
    } else if (data === 'cancel') {
      await sendTelegramMessage(fromId, '❌ Tindakan dibatalkan.');
    }

    return NextResponse.json({ ok: true });
  }

  const message = body.message;
  if (!message || !message.from) {
    return NextResponse.json({ ok: true });
  }

  const chatId = message.chat.id;
  const telegramId = message.from.id;
  const text = message.text || '';
  const photo = message.photo;

  // 1. Identify User
  const user = await getUserByTelegramId(telegramId);
  if (!user) {
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.vercel.app';
    const loginUrl = `${appBaseUrl}/dashboard/login?telegram_id=${telegramId}`;

    await sendTelegramMessage(
      chatId,
      `Halo ${message.from.first_name || 'Teman'}! 👋\nAkun Telegram kamu belum terhubung dengan sistem.\nSilakan klik tombol di bawah untuk login / mendaftar:`,
      {
        inline_keyboard: [[{ text: '🔑 Login / Hubungkan Akun', url: loginUrl }]],
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

  // 3. Handle Special Commands
  if (text.startsWith('/start')) {
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.vercel.app';
    await sendTelegramMessage(
      chatId,
      `Selamat datang kembali, ${user.name || 'Teman'}! 👋\nSaya adalah Asisten Keuangan & Aktivitas Personal kamu.\n\nKamu bisa langsung mencatat pengeluaran, aktivitas, atau tanya rekomendasi keuangan!`,
      buildDashboardInlineKeyboard(`${appBaseUrl}/dashboard`)
    );
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith('/dashboard')) {
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.vercel.app';
    await sendTelegramMessage(
      chatId,
      'Klik tombol di bawah untuk membuka Web Dashboard interaktif kamu:',
      buildDashboardInlineKeyboard(`${appBaseUrl}/dashboard`)
    );
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith('/hapus_semua')) {
    await sendTelegramMessage(
      chatId,
      '⚠️ **KONFIRMASI PENGHAPUSAN DATA**\n\nApakah kamu yakin ingin menghapus semua catatan pengeluaran dan aktivitas kamu?\n\n*(Data yang dihapus akan dipindahkan ke tempat sampah dan dapat dipulihkan oleh admin jika diperlukan)*',
      buildConfirmationInlineKeyboard('confirm_delete_all', 'cancel')
    );
    return NextResponse.json({ ok: true });
  }

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

  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // 5. Handle Photo (Receipt OCR) asynchronously
  if (photo && photo.length > 0) {
    const largestPhoto = photo[photo.length - 1]; // get highest resolution
    const fileId = largestPhoto.file_id;

    // Trigger OCR processing asynchronously to prevent Telegram timeout
    fetch(`${appBaseUrl}/api/receipts/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        chatId,
        fileId,
      }),
    }).catch((err) => console.error('Background receipt process error:', err));

    return NextResponse.json({ ok: true });
  }

  // 6. Handle Regular Text Message (Chat Orchestration) asynchronously
  fetch(`${appBaseUrl}/api/chat/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id,
      chatId,
      userMessage: text,
      userName: user.name || message.from.first_name,
    }),
  }).catch((err) => console.error('Background chat respond error:', err));

  // Return HTTP 200 OK immediately to Telegram (<50ms)
  return NextResponse.json({ ok: true });
}
