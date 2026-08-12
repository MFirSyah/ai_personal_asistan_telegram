import { NextRequest, NextResponse, after } from 'next/server';
import { verifyTelegramWebhook } from '@/lib/telegram/verify-webhook';
import { getUserByTelegramId, touchOrStartSession, updateUserName } from '@/lib/supabase/queries/sessions';
import { checkAndUpdateRateLimit } from '@/lib/gemini/rate-limiter';
import { sendTelegramMessage, sendTelegramChatAction, setTelegramBotCommands, sendTelegramDocument } from '@/lib/telegram/send-message';
import { buildConfirmationInlineKeyboard, buildDashboardInlineKeyboard } from '@/lib/telegram/inline-keyboard';
import { scheduleBatchJob } from '@/lib/jobs/create-job';
import { processChatRespondDirect } from '@/lib/telegram/chat-processor';
import { processReceiptDirect } from '@/lib/telegram/receipt-processor';
import { calculate20Analytics } from '@/lib/analytics/calculators';
import { getUserPreferences, saveUserPreference } from '@/lib/supabase/queries/preferences';
import { getRecentTransactions, getRecentActivities, randomizeTransactionTimestamps, randomizeActivityTimestamps } from '@/lib/supabase/queries/transactions';
import { generateExportFile } from '@/lib/export/export-data';
import { linkPartnerAccounts } from '@/lib/features/couples';
import { calculateSplitBill } from '@/lib/features/split-bill';
import { getUserSubscriptions, getUserDebts, markAllDebtsPaid } from '@/lib/features/smart-alerts';
import { getUserHabits, completeAllActivities } from '@/lib/features/habits-and-tasks';
import { generateMonthlyPdfReport } from '@/lib/features/pdf-report';
import { processVoiceNoteDirect } from '@/lib/telegram/voice-processor';
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
    const [insights, recentTxs, recentActs] = await Promise.all([
      calculate20Analytics(user.id),
      getRecentTransactions(user.id, 5),
      getRecentActivities(user.id, 5),
    ]);

    const expenseItem = insights.find((i) => i.id === 1);
    const incomeItem = insights.find((i) => i.id === 2);
    const netItem = insights.find((i) => i.id === 3);
    const catItem = insights.find((i) => i.id === 4);
    const merchantItem = insights.find((i) => i.id === 6);
    const projectionItem = insights.find((i) => i.id === 15);
    const scoreItem = insights.find((i) => i.id === 20);

    const totalExpense = expenseItem?.data?.amount || 0;
    const totalIncome = incomeItem?.data?.amount || 0;
    const netSavings = netItem?.data?.amount || 0;
    const projectedExpense = projectionItem?.data?.projectedExpense || 0;
    const healthScore = scoreItem?.data?.score || 'N/A';

    let summaryMsg = `📊 **LAPORAN & RINGKASAN GABUNGAN (KEUANGAN & AKTIVITAS)** 📊\n\n`;
    summaryMsg += `👤 **User**: ${user.name || 'Teman'}\n`;
    summaryMsg += `💸 **Total Pengeluaran**: Rp ${Number(totalExpense).toLocaleString('id-ID')}\n`;
    summaryMsg += `💰 **Total Pemasukan**: Rp ${Number(totalIncome).toLocaleString('id-ID')}\n`;
    summaryMsg += `📈 **Net Tabungan**: Rp ${Number(netSavings).toLocaleString('id-ID')}\n\n`;
    summaryMsg += `🔮 **Proyeksi Akhir Bulan**: Rp ${Number(projectedExpense).toLocaleString('id-ID')}\n`;
    summaryMsg += `🛡️ **Skor Kesehatan Finansial**: ${healthScore}\n\n`;

    // Category breakdown
    if (catItem?.chartData?.length) {
      summaryMsg += `🏷️ **Rincian Per Kategori**:\n`;
      catItem.chartData.slice(0, 5).forEach((entry: any) => {
        summaryMsg += `• **${entry.name}**: Rp ${Number(entry.value).toLocaleString('id-ID')}\n`;
      });
      summaryMsg += `\n`;
    }

    // Top merchants
    const merchants = merchantItem?.data?.topMerchants as Array<[string, number]> | undefined;
    if (merchants?.length) {
      summaryMsg += `🏪 **Top Tempat Belanja / Merchant**:\n`;
      merchants.forEach(([m, val]) => {
        summaryMsg += `• **${m}**: Rp ${Number(val).toLocaleString('id-ID')}\n`;
      });
      summaryMsg += `\n`;
    }

    // Recent 5 transactions
    if (recentTxs?.length) {
      summaryMsg += `📌 **5 Catatan Transaksi Keuangan Terakhir**:\n`;
      recentTxs.forEach((t) => {
        const icon = t.type === 'income' ? '🟢' : '🔴';
        const rawDate = t.occurred_at || t.created_at;
        const dt = new Date(rawDate);
        const isDummyJan1 = dt.getFullYear() === 2026 && dt.getMonth() === 0 && dt.getDate() === 1;
        const finalDt = (isDummyJan1 && t.created_at) ? new Date(t.created_at) : dt;
        const dateStr = finalDt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        const nameStr = t.merchant || t.description || 'Transaksi';
        summaryMsg += `${icon} \`${dateStr}\` | ${nameStr}: **Rp ${Number(t.amount).toLocaleString('id-ID')}**\n`;
      });
      summaryMsg += `\n`;
    }

    // Recent 5 activities
    if (recentActs?.length) {
      summaryMsg += `📅 **5 Catatan Agenda & Aktivitas Terakhir**:\n`;
      recentActs.forEach((a) => {
        const priorityIcon = a.priority === 'urgent' ? '🚨' : a.priority === 'high' ? '⚠️' : '📌';
        const rawDate = a.occurred_at || a.created_at;
        const dt = new Date(rawDate);
        const isDummyJan1 = dt.getFullYear() === 2026 && dt.getMonth() === 0 && dt.getDate() === 1;
        const finalDt = (isDummyJan1 && a.created_at) ? new Date(a.created_at) : dt;
        const dateStr = finalDt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        summaryMsg += `${priorityIcon} \`${dateStr}\` | **${a.title}** (${a.status || 'Aktif'})\n`;
      });
      summaryMsg += `\n`;
    }

    summaryMsg += `💡 *Untuk melihat visualisasi grafik 20 analisis lengkap, klik tombol di bawah ini:*`;

    await sendTelegramMessage(
      chatId,
      summaryMsg,
      buildDashboardInlineKeyboard(`${appBaseUrl}/dashboard?telegram_id=${telegramId}`)
    );
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith('/export')) {
    sendTelegramChatAction(chatId, 'upload_photo').catch(console.error);
    try {
      const exportResult = await generateExportFile(user.id, { target: 'all' });
      await sendTelegramDocument(chatId, exportResult.buffer, exportResult.filename, exportResult.caption);
    } catch (expErr: any) {
      await sendTelegramMessage(chatId, `⚠️ Gagal meng-export data: ${expErr?.message || 'Error tidak diketahui'}`);
    }
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith('/selesaikan_semua_aktivitas') || text.toLowerCase().includes('selesaikan semua aktivitas')) {
    const count = await completeAllActivities(user.id);
    await sendTelegramMessage(
      chatId,
      `✅ **BATCH PROSES AKTIVITAS SELESAI!**\n\nSebanyak **${count} agenda** telah diperbarui statusnya menjadi **Completed (Selesai)**!`
    );
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith('/lunas_semua_utang') || text.toLowerCase().includes('lunas semua utang') || text.toLowerCase().includes('utang lunas semua')) {
    const count = await markAllDebtsPaid(user.id);
    await sendTelegramMessage(
      chatId,
      `💰 **BATCH PROSES HUTANG SELESAI!**\n\nSebanyak **${count} catatan hutang** telah berhasil diperbarui statusnya menjadi **Lunas (Paid)**!`
    );
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith('/acak_jam') || text.startsWith('/update_tanggal')) {
    const parts = text.split(' ').filter(Boolean);
    const startHr = parts[1] && !isNaN(parseInt(parts[1], 10)) ? parseInt(parts[1], 10) : 8;
    const endHr = parts[2] && !isNaN(parseInt(parts[2], 10)) ? parseInt(parts[2], 10) : 21;
    const targetDate = new Date().toISOString().split('T')[0];

    const [txCount, actCount] = await Promise.all([
      randomizeTransactionTimestamps(user.id, targetDate, startHr, endHr),
      randomizeActivityTimestamps(user.id, targetDate, startHr, endHr),
    ]);

    await sendTelegramMessage(
      chatId,
      `⏰ **BERHASIL MENGACAK TANGGAL & JAM!**\n\n• **Tanggal Target**: ${targetDate} (Hari Ini)\n• **Rentang Jam**: ${String(startHr).padStart(2, '0')}:00 - ${String(endHr).padStart(2, '0')}:00 WIB\n• **Total Transaksi Diperbarui**: ${txCount}\n• **Total Aktivitas Diperbarui**: ${actCount}`
    );
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith('/langganan')) {
    const subs = await getUserSubscriptions(user.id);
    if (!subs.length) {
      await sendTelegramMessage(chatId, 'ℹ️ Belum ada tagihan langganan yang dicatat.');
    } else {
      let msg = `💳 **DAFTAR LANGGANAN RUTIN**\n\n`;
      subs.forEach((s) => {
        msg += `• **${s.service_name}**: Rp ${Number(s.amount).toLocaleString('id-ID')} (Jatuh tempo: ${s.next_billing_date})\n`;
      });
      await sendTelegramMessage(chatId, msg);
    }
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith('/patungan') || text.startsWith('/split')) {
    const command = text.startsWith('/split') ? '/split' : '/patungan';
    const rawArgs = text.replace(command, '').trim();
    if (!rawArgs) {
      await sendTelegramMessage(
        chatId,
        `🧾 **KALKULATOR PATUNGAN BAYAR (SPLIT BILL)**\n\nCara pakai:\n\`${command} 150000 Budi, Andi, Caca\`\n*(contoh: total Rp 150.000 dibagi untuk 3 orang)*`
      );
      return NextResponse.json({ ok: true });
    }

    const parts = rawArgs.split(' ');
    const amount = parseFloat(parts[0].replace(/[^0-9]/g, '')) || 0;
    const peopleStr = parts.slice(1).join(' ');
    const people = peopleStr ? peopleStr.split(',').map((s: string) => s.trim()).filter(Boolean) : ['Saya'];

    const result = calculateSplitBill({
      totalBill: amount,
      people: people.length ? people : ['Saya', 'Teman'],
    });

    await sendTelegramMessage(chatId, result.formattedSummary);
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith('/pasangan')) {
    const partnerNameOrId = text.replace('/pasangan', '').trim();
    if (!partnerNameOrId) {
      const { data: userRow } = await supabaseAdmin.from('users').select('partner_user_id').eq('id', user.id).single();
      let partnerInfo = 'Belum terhubung';
      if (userRow?.partner_user_id) {
        const { data: partnerRow } = await supabaseAdmin.from('users').select('name').eq('id', userRow.partner_user_id).single();
        partnerInfo = partnerRow?.name || 'Terhubung';
      }

      await sendTelegramMessage(
        chatId,
        `💖 **HUBUNGKAN AKUN PASANGAN**\n\nStatus: **${partnerInfo}**\n\nUntuk menghubungkan akun dengan pasangan, ketik:\n\`/pasangan [Nama_Atau_TelegramID_Pasangan]\``
      );
      return NextResponse.json({ ok: true });
    }

    const res = await linkPartnerAccounts(user.id, partnerNameOrId);
    await sendTelegramMessage(chatId, res.message);
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith('/utang')) {
    const debts = await getUserDebts(user.id);
    if (!debts.length) {
      await sendTelegramMessage(chatId, '🎉 Selamat! Belum ada catatan utang/piutang yang belum lunas.');
    } else {
      let msg = `📋 **DAFTAR UTANG & PIUTANG**\n\n`;
      debts.forEach((d) => {
        const typeStr = d.type === 'i_owe' ? '🔴 Utang Saya Ke' : '🟢 Piutang Dari';
        msg += `• ${typeStr} **${d.person_name}**: Rp ${Number(d.amount).toLocaleString('id-ID')}\n`;
      });
      await sendTelegramMessage(chatId, msg);
    }
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith('/habit')) {
    const habits = await getUserHabits(user.id);
    if (!habits.length) {
      await sendTelegramMessage(chatId, 'ℹ️ Belum ada habit tracker. Kamu bisa minta AI untuk mencatat habit baru!');
    } else {
      let msg = `🔥 **HABIT TRACKER & STREAK**\n\n`;
      habits.forEach((h) => {
        msg += `• **${h.title}**: 🔥 ${h.streak_count} Hari Streak\n`;
      });
      await sendTelegramMessage(chatId, msg);
    }
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith('/pdf') || text.startsWith('/laporan_pdf')) {
    sendTelegramChatAction(chatId, 'upload_photo').catch(console.error);
    try {
      const pdfResult = await generateMonthlyPdfReport(user.id);
      await sendTelegramDocument(chatId, pdfResult.buffer, pdfResult.filename, pdfResult.caption);
    } catch (pdfErr: any) {
      await sendTelegramMessage(chatId, `⚠️ Gagal meng-generate laporan PDF: ${pdfErr?.message || 'Error'}`);
    }
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
    for (let idx = 0; idx < prefs.length; idx++) {
      const p = prefs[idx];
      const cleanKey = String(p.key || '').replace(/[*_`]/g, '').trim();
      const cleanVal = String(p.value || '').replace(/[*_`]/g, '').trim();
      const cleanLearned = p.learned_from ? String(p.learned_from).replace(/[*_`]/g, '').trim() : undefined;

      // Auto-repair corrupted Markdown symbols in database
      if (cleanKey !== p.key || cleanVal !== p.value) {
        saveUserPreference(user.id, cleanKey, cleanVal, cleanLearned).catch(console.error);
      }

      prefMsg += `${idx + 1}. **${cleanKey}**: ${cleanVal}\n`;
      if (cleanLearned) {
        prefMsg += `   _(Konteks: ${cleanLearned})_\n`;
      }
    }

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
    helpMsg += `- /nama : Lihat & ubah nama panggilan AI\n`;
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
