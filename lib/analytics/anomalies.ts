import { supabaseAdmin } from '../supabase/client';

export interface FinancialAnomalyAlert {
  isAnomaly: boolean;
  type: 'high_expense' | 'high_income' | 'unusual_category';
  title: string;
  message: string;
  severity: 'warning' | 'critical';
}

export interface ActivityCollisionAlert {
  isCollision: boolean;
  title: string;
  message: string;
  conflictingTitle: string;
  conflictingTime: string;
}

/**
 * Checks if a newly inserted transaction is an anomaly compared to historical data.
 */
export async function checkTransactionAnomaly(
  userId: string,
  newTx: { amount: number; type: string; merchant?: string; occurred_at?: string }
): Promise<FinancialAnomalyAlert | null> {
  try {
    const { data: pastTxs } = await supabaseAdmin
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userId)
      .eq('type', newTx.type || 'expense')
      .is('deleted_at', null)
      .limit(100);

    if (!pastTxs || pastTxs.length < 3) {
      const threshold = newTx.type === 'income' ? 10000000 : 1000000;
      if (newTx.amount >= threshold) {
        const formattedAmount = new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0,
        }).format(newTx.amount);

        return {
          isAnomaly: true,
          type: newTx.type === 'income' ? 'high_income' : 'high_expense',
          title: `🚨 ANOMALI ${newTx.type === 'income' ? 'PEMASUKAN' : 'PENGELUARAN'} BESAR`,
          severity: newTx.amount >= 5000000 ? 'critical' : 'warning',
          message: `Catatan ${newTx.type === 'income' ? 'pemasukan' : 'pengeluaran'} sebesar **${formattedAmount}** (${newTx.merchant || 'Umum'}) terdeteksi bernominal di atas ambang batas normal. Harap pastikan kembali catatannya.`,
        };
      }
      return null;
    }

    const amounts = pastTxs.map((t) => Number(t.amount || 0)).filter((amt) => amt > 0);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const maxPastAmount = Math.max(...amounts, 0);

    if (newTx.amount >= 500000 && newTx.amount > avgAmount * 2.5) {
      const formattedAmount = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(newTx.amount);
      const formattedAvg = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(avgAmount);

      return {
        isAnomaly: true,
        type: newTx.type === 'income' ? 'high_income' : 'high_expense',
        title: `🚨 ANOMALI KEUANGAN TERDETEKSI!`,
        severity: newTx.amount > maxPastAmount ? 'critical' : 'warning',
        message: `Nominal ${newTx.type === 'income' ? 'pemasukan' : 'pengeluaran'} **${formattedAmount}** (${newTx.merchant || 'Umum'}) bernilai **2.5x lipat lebih tinggi dari rata-rata riwayat kamu** (${formattedAvg}).`,
      };
    }

    return null;
  } catch (err) {
    console.error('Error checking transaction anomaly:', err);
    return null;
  }
}

/**
 * Checks if a newly inserted activity collides/overlaps with existing activities on the same day/time.
 */
export async function checkActivityCollision(
  userId: string,
  newAct: { title: string; occurred_at?: string }
): Promise<ActivityCollisionAlert | null> {
  try {
    let actTime = newAct.occurred_at ? new Date(newAct.occurred_at) : new Date();
    if (isNaN(actTime.getTime())) {
      actTime = new Date();
    }
    const windowStart = new Date(actTime.getTime() - 60 * 60 * 1000).toISOString();
    const windowEnd = new Date(actTime.getTime() + 60 * 60 * 1000).toISOString();

    const { data: nearbyActs } = await supabaseAdmin
      .from('activities')
      .select('id, title, occurred_at')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .neq('title', newAct.title)
      .gte('occurred_at', windowStart)
      .lte('occurred_at', windowEnd)
      .limit(5);

    if (nearbyActs && nearbyActs.length > 0) {
      const conflict = nearbyActs[0];
      let conflictDate = new Date(conflict.occurred_at);
      if (isNaN(conflictDate.getTime())) conflictDate = new Date();

      let formattedTime = '00.00 WIB';
      try {
        formattedTime =
          conflictDate.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Jakarta',
          }) + ' WIB';
      } catch (tErr) {
        formattedTime = `${String(conflictDate.getHours()).padStart(2, '0')}:${String(conflictDate.getMinutes()).padStart(2, '0')} WIB`;
      }

      return {
        isCollision: true,
        title: `⚠️ PERINGATAN JADWAL BENTROK (COLLISION)!`,
        conflictingTitle: conflict.title,
        conflictingTime: formattedTime,
        message: `Agenda baru **"${newAct.title}"** berdekatan/berbenturan waktu dengan agenda lain: **"${conflict.title}"** (Jam ${formattedTime}). Harap atur ulang jamnya agar tidak berbenturan.`,
      };
    }

    return null;
  } catch (err) {
    console.error('Error checking activity collision:', err);
    return null;
  }
}
