import { NextRequest, NextResponse, after } from 'next/server';
import { verifyTelegramWebhook } from '@/lib/telegram/verify-webhook';
import { getUserByTelegramId, touchOrStartSession, updateUserName } from '@/lib/supabase/queries/sessions';
import { checkAndUpdateRateLimit } from '@/lib/gemini/rate-limiter';
import { sendTelegramMessage, sendTelegramChatAction, setTelegramBotCommands } from '@/lib/telegram/send-message';
import { buildConfirmationInlineKeyboard, buildDashboardInlineKeyboard } from '@/lib/telegram/inline-keyboard';
import { scheduleBatchJob } from '@/lib/jobs/create-job';
import { processChatRespondDirect } from '@/lib/telegram/chat-processor';
import { processReceiptDirect } from '@/lib/telegram/receipt-processor';
import { calculate20Analytics } from '@/lib/analytics/calculators';
import { getUserPreferences } from '@/lib/supabase/queries/preferences';
import { supabaseAdmin } from '@/lib/supabase/client';

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
    // Register commands menu in Telegram autocomplete list asynchronously
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

  if (text.startsWith('/ringkasan') || text.startsWith('/laporan')) {
    sendTelegramChatAction(chatId, 'typing').catch(console.error);

    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-personal-asistan-telegram.vercel.app';
    const insights = await calculate20Analytics(user.id);

    const expenseItem = insights.find((i) => i.id === 1);
    const incomeItem = insights.find((i) => i.id === 2);
    const netItem = insights.find((i) => i.id === 3);
    const projectionItem = insights.find((i) => i.id === 15);
    const scoreItem = insights.find((i) => i.id === 20);

    const totalExpense = expenseItem?.data?.amount || 0;
    const totalIncome = incomeItem?.data?.amount || 0;
    const netSavings = netItem?.data?.amount || 0;
    const projectedExpense = projectionItem?.data?.projectedExpense || 0;
    const healthScore = scoreItem?.data?.score || 'N/A';

    let summaryMsg = `📊 **LAPORAN & RINGKASAN KEUANGAN** 📊\n\n`;
    summaryMsg += `👤 **User**: ${user.name || 'Teman'}\n`;
    summaryMsg += `💸 **Total Pengeluaran**: Rp ${Number(totalExpense).toLocaleString('id-ID')}\n`;
    summaryMsg += `💰 **Total Pemasukan**: Rp ${Number(totalIncome).toLocaleString('id-ID')}\n`;
    summaryMsg += `📈 **Net Tabungan**: Rp ${Number(netSavings).toLocaleString('id-ID')}\n\n`;
    summaryMsg += `🔮 **Proyeksi Akhir Bulan**: Rp ${Number(projectedExpense).toLocaleString('id-ID')}\n`;
    summaryMsg += `🛡️ **Skor Kesehatan**: ${healthScore}\n\n`;
    summaryMsg += `💡 *Untuk melihat visualisasi grafik 20 analisis lengkap, klik tombol di bawah ini:*`;

    await sendTelegramMessage(
      chatId,
      summaryMsg,
      buildDashboardInlineKeyboard(`${appBaseUrl}/dashboard?telegram_id=${telegramId}`)
    );
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith('/progress')) {
    const { data: latestJob } = await supabaseAdmin
      .from('batch_jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latestJob) {
      await sendTelegramMessage(chatId, 'ℹ️ Tidak ada tugas background yang pernah berjalan.');
      return NextResponse.json({ ok: true });
    }

    let jobMsg = `🔄 **STATUS PROGRESS TUGAS BACKGROUND**\n\n`;
    jobMsg += `📌 **Tipe**: ${latestJob.type}\n`;
    jobMsg += `STATUS: ${latestJob.status.toUpperCase()}\n`;
    jobMsg += `📊 **Progress**: ${latestJob.processed_items} / ${latestJob.total_items} item\n`;

    if (latestJob.error_message) {
      jobMsg += `⚠️ **Error**: ${latestJob.error_message}\n`;
    }

    await sendTelegramMessage(chatId, jobMsg);
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith('/preferensi')) {
    const prefs = await getUserPreferences(user.id);
    if (prefs.length === 0) {
      await sendTelegramMessage(chatId, 'ℹ️ Belum ada preferensi personal yang dipelajari AI dari percakapan kamu.');
      return NextResponse.json({ ok: true });
    }

    let prefMsg = `⚙️ **PREFERENSI & POLA YANG DIPELAJARI AI**\n\n`;
    prefs.forEach((p, idx) => {
      prefMsg += `${idx + 1}. **${p.key}**: ${p.value}\n`;
      if (p.learned_from) {
        prefMsg += `   _(Konteks: ${p.learned_from})_\n`;
      }
    });

    await sendTelegramMessage(chatId, prefMsg);
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith('/nama')) {
    const newName = text.replace('/nama', '').trim();
    if (!newName) {
      const currentName = user.name || 'Belum diatur';
      await sendTelegramMessage(
        chatId,
        `👤 **PENGATURAN NAMA PANGGILAN AI**\n\nNama kamu yang terdaftar saat ini: **${currentName}**\n\nUntuk mengubah nama panggilannya, ketik:\n\`/nama NamaKamu\` *(contoh: \`/nama Firman\` atau \`/nama Mas Firman\`)*`
      );
      return NextResponse.json({ ok: true });
    }

    await updateUserName(user.id, newName);
    await saveUserPreference(user.id, 'nama_panggilan', newName, 'Pengaturan Perintah /nama');

    await sendTelegramMessage(
      chatId,
      `✅ **Nama Panggilan Berhasil Diubah!**\nMulai sekarang AI akan selalu memanggil kamu dengan nama: **${newName}**.`
    );
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith('/briefing')) {
    const args = text.replace('/briefing', '').trim();

    if (args) {
      // Set briefing time (e.g. /briefing 07:00)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(args)) {
        await sendTelegramMessage(chatId, '⚠️ Format jam salah. Gunakan format HH:MM (contoh: `/briefing 07:00`).');
        return NextResponse.json({ ok: true });
      }

      await supabaseAdmin.from('user_settings').upsert({
        user_id: user.id,
        briefing_enabled: true,
        briefing_time: `${args}:00`,
        timezone: 'Asia/Jakarta',
        updated_at: new Date().toISOString(),
      });

      await sendTelegramMessage(chatId, `✅ **Morning Briefing Diatur!**\nKamu akan menerima ringkasan pagi setiap hari jam **${args} WIB**.`);
      return NextResponse.json({ ok: true });
    }

    // Show current settings
    const { data: settings } = await supabaseAdmin
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const isEnabled = settings?.briefing_enabled ? 'Aktif ✅' : 'Non-Aktif ❌';
    const bTime = settings?.briefing_time ? settings.briefing_time.substring(0, 5) : 'Belum diatur';

    let briefingMsg = `⏰ **PENGATURAN MORNING BRIEFING**\n\n`;
    briefingMsg += `Status: ${isEnabled}\n`;
    briefingMsg += `Jam Kirim: ${bTime} WIB\n\n`;
    briefingMsg += `Untuk mengaktifkan/mengubah jam, ketik:\n\`/briefing 07:00\` *(isi dengan jam yang diinginkan)*`;

    await sendTelegramMessage(chatId, briefingMsg);
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith('/bantuan')) {
    let helpMsg = `📖 **PANDUAN PENGGUNAAN BOT ASISTEN** 📖\n\n`;
    helpMsg += `1️⃣ **Catat Keuangan**: Kirim pesan biasa (contoh: *"beli makan siang 25rb"* atau *"terima gaji 5jt"*).\n`;
    helpMsg += `2️⃣ **Scan Struk**: Cukup kirim foto struk belanja kamu, AI akan membaca total & daftar barang otomatis!\n`;
    helpMsg += `3️⃣ **Agenda & Aktivitas**: Kirim jadwal (contoh: *"ingatkan sidang skripsi besok jam 10 pagi"*).\n`;
    helpMsg += `4️⃣ **Tanya Jawab AI**: Bebas bertukar pikiran atau tanya saran keuangan (*"gimana cara hemat bulan ini?"*).\n\n`;
    helpMsg += `Daftar Perintah Ringkas:\n`;
    helpMsg += `- /ringkasan : Rekap cepat keuangan\n`;
    helpMsg += `- /dashboard : Mini App interaktif\n`;
    helpMsg += `- /progress : Cek proses hapus/job\n`;
    helpMsg += `- /preferensi : Pola yang dipelajari AI\n`;
    helpMsg += `- /briefing : Atur pengingat pagi\n`;
    helpMsg += `- /hapus_semua : Hapus data kamu`;

    await sendTelegramMessage(chatId, helpMsg);
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

  // 5. Send typing indicator immediately (<30ms)
  sendTelegramChatAction(chatId, photo ? 'upload_photo' : 'typing').catch(console.error);

  // 6. Use Next.js after() to execute background task in Vercel serverless without termination
  after(async () => {
    if (photo && photo.length > 0) {
      const largestPhoto = photo[photo.length - 1];
      await processReceiptDirect(user.id, chatId, largestPhoto.file_id);
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
