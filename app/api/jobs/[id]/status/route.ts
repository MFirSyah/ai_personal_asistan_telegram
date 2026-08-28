import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Job ID diperlukan' }, { status: 400 });
    }

    const { data: job, error } = await supabaseAdmin
      .from('receipt_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !job) {
      return NextResponse.json({ status: 'not_found', message: error?.message || 'Job tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      id: job.id,
      status: job.status,
      created_at: job.created_at,
      metadata: job.metadata
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
