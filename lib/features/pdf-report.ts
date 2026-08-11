import PDFDocument from 'pdfkit';
import { calculate20Analytics } from '../analytics/calculators';
import { getRecentTransactions } from '../supabase/queries/transactions';
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

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => {
      const buffer = Buffer.concat(buffers);
      const filename = `Laporan_Keuangan_${userName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      resolve({
        buffer,
        filename,
        caption: `📄 **LAPORAN EKSKUTIF BULANAN (PDF)**\n\nBerikut adalah dokumen resmi PDF laporan keuangan bulanan untuk **${userName}** yang disusun oleh AI.`,
      });
    });
    doc.on('error', (err) => reject(err));

    // Header styling
    doc.fillColor('#6366f1').fontSize(20).text('LAPORAN EKSKUTIF KEUANGAN BULANAN', { align: 'center' });
    doc.fillColor('#6b7280').fontSize(11).text(`Periode: ${todayStr}`, { align: 'center' });
    doc.moveDown(1.5);

    // Summary Box
    doc.fillColor('#1e293b').fontSize(13).text(`Pemilik Akun: ${userName}`);
    doc.fillColor('#059669').fontSize(12).text(`Skor Kesehatan Finansial: ${healthScore} / 100`);
    doc.moveDown(1);

    // Financial Metrics
    doc.fillColor('#475569').fontSize(12).text('Ringkasan Arus Kas (Cash Flow Summary):', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#334155');
    doc.text(`• Total Pemasukan  : Rp ${Number(totalIncome).toLocaleString('id-ID')}`);
    doc.text(`• Total Pengeluaran: Rp ${Number(totalExpense).toLocaleString('id-ID')}`);
    doc.text(`• Surplus Tabungan : Rp ${Number(netSavings).toLocaleString('id-ID')}`);
    doc.moveDown(1.5);

    // Transaction Table Header
    doc.fillColor('#475569').fontSize(12).text('Catatan 20 Transaksi Terakhir:', { underline: true });
    doc.moveDown(0.5);

    if (txs.length === 0) {
      doc.fillColor('#94a3b8').fontSize(10).text('Belum ada catatan transaksi keuangan.');
    } else {
      txs.forEach((t, idx) => {
        const rawDate = t.occurred_at || t.created_at;
        const dt = new Date(rawDate);
        const d = isNaN(dt.getTime()) ? '-' : dt.toLocaleDateString('id-ID');
        const typeStr = t.type === 'income' ? '[PEMASUKAN]' : '[PENGELUARAN]';
        const color = t.type === 'income' ? '#059669' : '#e11d48';
        const rawName = t.merchant || t.description || 'Transaksi';
        const cleanName = rawName.replace(/[^\x00-\x7F]/g, '').trim() || 'Transaksi';
        doc
          .fillColor(color)
          .fontSize(9)
          .text(
            `${idx + 1}. ${d} | ${typeStr} ${cleanName}: Rp ${Number(t.amount).toLocaleString('id-ID')}`
          );
      });
    }

    doc.moveDown(2);
    doc.fillColor('#94a3b8').fontSize(8).text('Diterbitkan Otomatis Oleh AI Personal Assistant', { align: 'center' });

    doc.end();
  });
}
