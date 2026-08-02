import { createBatchJob, BatchJob } from '../supabase/queries/jobs';

export async function scheduleBatchJob(
  userId: string,
  type: 'delete_all' | 'generate_data' | 'reprocess_receipts',
  totalItems: number,
  payload?: any,
  batchSize = 5
): Promise<BatchJob> {
  return await createBatchJob(userId, type, totalItems, payload, batchSize);
}
