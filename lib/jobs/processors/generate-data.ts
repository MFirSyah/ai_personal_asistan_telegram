import { supabaseAdmin } from '../../supabase/client';

export async function processGenerateDataBatch(userId: string, batchSize: number): Promise<number> {
  const sampleItems = [
    { type: 'expense', amount: 25000, merchant: 'Warung Makan', description: 'Makan Siang' },
    { type: 'expense', amount: 15000, merchant: 'Kopi Kenangan', description: 'Kopi Susu' },
    { type: 'expense', amount: 50000, merchant: 'Pertamina', description: 'Bensin Motor' },
    { type: 'income', amount: 5000000, merchant: 'Gaji Utama', description: 'Pemasukan Bulanan' },
  ];

  const now = new Date();
  const rowsToInsert = [];

  for (let i = 0; i < batchSize; i++) {
    const item = sampleItems[i % sampleItems.length];
    rowsToInsert.push({
      user_id: userId,
      amount: item.amount,
      type: item.type,
      merchant: item.merchant,
      description: item.description,
      source: 'chat_manual',
      occurred_at: new Date(now.getTime() - i * 3600 * 1000).toISOString(),
    });
  }

  const { data, error } = await supabaseAdmin.from('transactions').insert(rowsToInsert).select();
  if (error) throw new Error(`Data generation failed: ${error.message}`);
  return data ? data.length : 0;
}
