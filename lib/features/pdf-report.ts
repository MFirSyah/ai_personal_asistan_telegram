import { calculate20Analytics } from '../analytics/calculators';
import { getRecentTransactions } from '../supabase/queries/transactions';
import { getUserPreferences } from '../supabase/queries/preferences';
import { supabaseAdmin } from '../supabase/client';

export async function generateMonthlyPdfReport(userId: string): Promise<{
  buffer: Buffer;
  filename: string;
  caption: string;
}> {
  const { data: user } = await supabaseAdmin.from('users').select('name').eq('id', userId).single();
  const userName = user?.name || 'Pengguna';

  const [insights, txs] = await Promise.all([
    calculate20Analytics(userId),
    getRecentTransactions(userId, 20),
  ]);

  const expenseItem = insights.find((i) => i.id === 1);
  const incomeItem = insights.find((i) => i.id === 2);
  const netItem = insights.find((i) => i.id === 3);
  const scoreItem = insights.find((i) => i.id === 20);

  const totalExpense = expenseItem?.data?.amount || 0;
  const totalIncome = incomeItem?.data?.amount || 0;
  const netSavings = netItem?.data?.amount || 0;
  const healthScore = scoreItem?.data?.score || 'N/A';

  const todayStr = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  // Generate clean text-based report formatted as a document
  let reportText = `====================================================\n`;
  reportText += `     LAPORAN EKSKUTIF KEUANGAN BULANAN              \n`;
  reportText += `     Periode: ${todayStr}                          \n`;
  reportText += `====================================================\n\n`;

  reportText += `PEMILIK AKUN: ${userName}\n`;
  reportText += `SKOR KESEHATAN FINANSIAL: ${healthScore} / 100\n\n`;

  reportText += `----------------------------------------------------\n`;
  reportText += `RINGKASAN ARUS KAS (CASH FLOW SUMMARY)\n`;
  reportText += `----------------------------------------------------\n`;
  reportText += `• Total Pemasukan  : Rp ${Number(totalIncome).toLocaleString('id-ID')}\n`;
  reportText += `• Total Pengeluaran: Rp ${Number(totalExpense).toLocaleString('id-ID')}\n`;
  reportText += `• Surplus Tabungan : Rp ${Number(netSavings).toLocaleString('id-ID')}\n\n`;

  reportText += `----------------------------------------------------\n`;
  reportText += `CATATAN TRANSAKSI TERAKHIR (LAST 20 TRANSACTIONS)\n`;
  reportText += `----------------------------------------------------\n`;

  txs.forEach((t, idx) => {
    const d = new Date(t.occurred_at).toLocaleDateString('id-ID');
    const typeStr = t.type === 'income' ? '[PEMASUKAN] ' : '[PENGELUARAN]';
    reportText += `${idx + 1}. ${d} | ${typeStr} ${t.merchant || t.description || 'Transaksi'}: Rp ${Number(t.amount).toLocaleString('id-ID')}\n`;
  });

  reportText += `\n====================================================\n`;
  reportText += `  Diterbitkan Otomatis Oleh AI Personal Assistant    \n`;
  reportText += `====================================================\n`;

  const filename = `Laporan_Keuangan_${userName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
  const buffer = Buffer.from(reportText, 'utf-8');

  return {
    buffer,
    filename,
    caption: `📄 **LAPORAN EKSKUTIF BULANAN**\n\nBerikut adalah laporan resmi keuangan bulanan untuk **${userName}** yang telah disusun oleh AI.`,
  };
}
