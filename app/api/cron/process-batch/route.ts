import { NextRequest, NextResponse } from 'next/server';
import { getNextPendingOrProcessingJob, updateBatchJobProgress } from '@/lib/supabase/queries/jobs';
import { processDeleteAllBatch } from '@/lib/jobs/processors/delete-all';
import { processGenerateDataBatch } from '@/lib/jobs/processors/generate-data';
import { processReprocessReceiptsBatch } from '@/lib/jobs/processors/reprocess-receipts';
import { notifyJobProgress } from '@/lib/jobs/notify-progress';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
  }

  try {
    const job = await getNextPendingOrProcessingJob();

    if (!job) {
      return NextResponse.json({ ok: true, message: 'No pending batch jobs' });
    }

    const batchSize = job.batch_size || 5;
    let itemsProcessedThisRun = 0;

    if (job.type === 'delete_all') {
      itemsProcessedThisRun = await processDeleteAllBatch(job.user_id, batchSize);
    } else if (job.type === 'generate_data') {
      itemsProcessedThisRun = await processGenerateDataBatch(job.user_id, batchSize);
    } else if (job.type === 'reprocess_receipts') {
      itemsProcessedThisRun = await processReprocessReceiptsBatch(job.user_id, batchSize);
    }

    const totalProcessed = (job.processed_items || 0) + itemsProcessedThisRun;
    const isDone = itemsProcessedThisRun === 0 || totalProcessed >= job.total_items;
    const newStatus = isDone ? 'done' : 'processing';

    await updateBatchJobProgress(job.id, totalProcessed, job.total_items, newStatus);

    if (isDone) {
      await notifyJobProgress(
        job.user_id,
        `✅ **Tugas Background Selesai!**\nProses "${job.type}" telah berhasil diselesaikan (${totalProcessed} item).`
      );
    }

    return NextResponse.json({
      ok: true,
      jobId: job.id,
      processedThisRun: itemsProcessedThisRun,
      totalProcessed,
      status: newStatus,
    });
  } catch (error: any) {
    console.error('Error processing batch job:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
