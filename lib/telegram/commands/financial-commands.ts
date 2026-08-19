import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { calculate20Analytics } from '@/lib/analytics/calculators';
import { getRecentTransactions, getRecentActivities } from '@/lib/supabase/queries/transactions';
import { sendTelegramMessage, sendTelegramChatAction, sendTelegramDocument } from '@/lib/telegram/send-message';
import { buildDashboardInlineKeyboard } from '@/lib/telegram/inline-keyboard';
import { generateExportFile } from '@/lib/export/export-data';
import { generateMonthlyPdfReport } from '@/lib/features/pdf-report';
import { getUserSubscriptions, getUserDebts } from '@/lib/features/smart-alerts';
import { calculateSplitBill } from '@/lib/features/split-bill';
import { linkPartnerAccounts } from '@/lib/features/couples';

export async function handleFinancialCommands(
  text: string,
  chatId: number | string,
  user: { id: string; name: string | null },
  telegramId: number
): Promise<NextResponse | null> {
  // /ringkasan & /laporan
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

    if (catItem?.chartData?.length) {
      summaryMsg += `🏷️ **Rincian Per Kategori**:\n`;
      catItem.chartData.slice(0, 5).forEach((entry: any) => {
        summaryMsg += `• **${entry.name}**: Rp ${Number(entry.value).toLocaleString('id-ID')}\n`;
      });
      summaryMsg += `\n`;
    }

    const merchants = merchantItem?.data?.topMerchants as Array<[string, number]> | undefined;
    if (merchants?.length) {
      summaryMsg += `🏪 **Top Tempat Belanja / Merchant**:\n`;
      merchants.forEach(([m, val]) => {
        summaryMsg += `• **${m}**: Rp ${Number(val).toLocaleString('id-ID')}\n`;
      });
      summaryMsg += `\n`;
    }

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

  // /export & /export_sql & /backup
  if (text.startsWith('/export') || text.startsWith('/backup')) {
    sendTelegramChatAction(chatId, 'upload_photo').catch(console.error);
    const isSql = text.includes('sql') || text.startsWith('/backup') || text.startsWith('/export_sql');
    try {
      const exportResult = await generateExportFile(user.id, {
        target: 'all',
        format: isSql ? 'sql' : 'csv',
      });
      await sendTelegramDocument(chatId, exportResult.buffer, exportResult.filename, exportResult.caption);
    } catch (expErr: any) {
      await sendTelegramMessage(chatId, `⚠️ Gagal meng-export data: ${expErr?.message || 'Error tidak diketahui'}`);
    }
    return NextResponse.json({ ok: true });
  }

  // /pdf
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

  // /langganan
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

  // /patungan & /split
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

  // /pasangan
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

  // /utang
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

  return null;
}
