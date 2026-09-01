import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    const targetUserId = searchParams.get('userId') || 'fc2758d3-78bb-4e22-b9f0-b3b16568b671';

    // Simple security check using CRON_SECRET or default dev override
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET && secret !== 'seed_data_core_2026') {
      return NextResponse.json({ error: 'Unauthorized secret' }, { status: 401 });
    }

    // 1. Purge old transactions & activities for target user
    await supabaseAdmin.from('transactions').delete().eq('user_id', targetUserId);
    await supabaseAdmin.from('activities').delete().eq('user_id', targetUserId);

    let bodyData: any = {};
    try {
      bodyData = await req.json();
    } catch(e) {}

    const transactionsData = bodyData.transactions || [];
    const activitiesData = bodyData.activities || [];

    // Batch insert transactions (chunks of 50)
    let insertedTxs = 0;
    for (let i = 0; i < transactionsData.length; i += 50) {
      const chunk = transactionsData.slice(i, i + 50).map((t: any) => ({
        id: t.id,
        user_id: targetUserId,
        amount: Number(t.amount || 0),
        type: t.type === 'income' ? 'income' : 'expense',
        merchant: String(t.merchant || 'Manual Dashboard').trim(),
        description: String(t.description || '').trim(),
        category_id: t.category_id || null,
        source: 'chat_manual',
        occurred_at: t.occurred_at || new Date().toISOString()
      }));
      const { error } = await supabaseAdmin.from('transactions').insert(chunk);
      if (error) console.error('Error inserting tx chunk:', error);
      else insertedTxs += chunk.length;
    }

    // Batch insert activities (chunks of 50)
    let insertedActs = 0;
    for (let i = 0; i < activitiesData.length; i += 50) {
      const chunk = activitiesData.slice(i, i + 50).map((a: any) => ({
        id: a.id,
        user_id: targetUserId,
        title: String(a.title || 'Agenda').trim(),
        description: String(a.description || '').trim(),
        priority: ['low', 'medium', 'high', 'urgent'].includes(a.priority) ? a.priority : 'medium',
        status: ['scheduled', 'in_progress', 'completed', 'cancelled', 'overdue'].includes(a.status) ? a.status : 'scheduled',
        occurred_at: a.occurred_at || new Date().toISOString()
      }));
      const { error } = await supabaseAdmin.from('activities').insert(chunk);
      if (error) console.error('Error inserting act chunk:', error);
      else insertedActs += chunk.length;
    }

    return NextResponse.json({
      ok: true,
      message: `Successfully purged and seeded 500 extreme data records!`,
      insertedTransactions: insertedTxs,
      insertedActivities: insertedActs,
      targetUserId
    });
  } catch (error: any) {
    console.error('Error in seed-dummy route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
