import { NextRequest, NextResponse } from 'next/server';
import { getJobById } from '@/lib/supabase/queries/jobs';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = await params;
  const job = await getJobById(jobId);

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: job.id,
    type: job.type,
    status: job.status,
    total_items: job.total_items,
    processed_items: job.processed_items,
    progress: job.total_items > 0 ? Math.round((job.processed_items / job.total_items) * 100) : 100,
    error_message: job.error_message,
  });
}
