import { supabaseAdmin } from '../../supabase/client';

export async function processDeleteAllBatch(userId: string, batchSize: number): Promise<number> {
  const now = new Date().toISOString();

  // Find un-deleted transactions
  const { data: txs } = await supabaseAdmin
    .from('transactions')
    .select('id')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .limit(batchSize);

  let count = 0;

  if (txs && txs.length > 0) {
    const ids = txs.map((t) => t.id);
    await supabaseAdmin.from('transactions').update({ deleted_at: now }).in('id', ids);
    count += ids.length;
  }

  if (count < batchSize) {
    const remaining = batchSize - count;
    const { data: acts } = await supabaseAdmin
      .from('activities')
      .select('id')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .limit(remaining);

    if (acts && acts.length > 0) {
      const ids = acts.map((a) => a.id);
      await supabaseAdmin.from('activities').update({ deleted_at: now }).in('id', ids);
      count += ids.length;
    }
  }

  return count;
}
