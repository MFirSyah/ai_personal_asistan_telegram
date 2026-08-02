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

  // Touch updated_at / audit flag
  for (const tx of receiptTxs) {
    await supabaseAdmin
      .from('transactions')
      .update({ raw_ai_response: { ...tx.raw_ai_response, reprocessed: true, reprocessed_at: new Date().toISOString() } })
      .eq('id', tx.id);
  }

  return receiptTxs.length;
}
