import { supabaseAdmin } from '../client';

export interface BatchJob {
  id: string;
  user_id: string;
  type: 'delete_all' | 'generate_data' | 'reprocess_receipts';
  status: 'pending' | 'processing' | 'done' | 'failed' | 'cancelled';
  total_items: number;
  processed_items: number;
  batch_size: number;
  payload?: any;
  error_message?: string;
  confirmed_at?: string;
  created_at: string;
  updated_at: string;
}

export async function createBatchJob(
  userId: string,
  type: 'delete_all' | 'generate_data' | 'reprocess_receipts',
  totalItems: number,
  payload?: any,
  batchSize = 5
): Promise<BatchJob> {
  const { data, error } = await supabaseAdmin
    .from('batch_jobs')
    .insert({
      user_id: userId,
      type,
      status: 'pending',
      total_items: totalItems,
      processed_items: 0,
      batch_size: batchSize,
      payload: payload || null,
      confirmed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !data) throw new Error(`Failed to create batch job: ${error?.message}`);
  return data as BatchJob;
}

export async function getNextPendingOrProcessingJob(): Promise<BatchJob | null> {
  const { data, error } = await supabaseAdmin
    .from('batch_jobs')
    .select('*')
    .in('status', ['pending', 'processing'])
    .not('confirmed_at', 'is', null)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as BatchJob;
}

export async function updateBatchJobProgress(
  jobId: string,
  processedItems: number,
  totalItems: number,
  status: 'pending' | 'processing' | 'done' | 'failed',
  errorMessage?: string
): Promise<BatchJob> {
  const updates: any = {
    processed_items: processedItems,
    status,
    updated_at: new Date().toISOString(),
  };

  if (errorMessage) updates.error_message = errorMessage;

  const { data, error } = await supabaseAdmin
    .from('batch_jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single();

  if (error || !data) throw new Error(`Failed to update batch job: ${error?.message}`);
  return data as BatchJob;
}

export async function getJobById(jobId: string): Promise<BatchJob | null> {
  const { data, error } = await supabaseAdmin
    .from('batch_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error || !data) return null;
  return data as BatchJob;
}
