import { supabaseAdmin } from '../../supabase/client';

export async function processReprocessReceiptsBatch(userId: string, batchSize: number): Promise<number> {
  const { data: receiptTxs } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('source', 'receipt_ocr')
    .is('deleted_at', null)
    .limit(batchSize);

  if (!receiptTxs || receiptTxs.length === 0) return 0;

  let processedCount = 0;
  for (const tx of receiptTxs) {
    try {
      await supabaseAdmin
        .from('transactions')
        .update({ raw_ai_response: { ...tx.raw_ai_response, reprocessed: true, reprocessed_at: new Date().toISOString() } })
        .eq('id', tx.id);
      processedCount++;
    } catch (itemErr) {
      console.error(`Failed to reprocess receipt tx ${tx.id}:`, itemErr);
    }
  }

  return processedCount;
}
