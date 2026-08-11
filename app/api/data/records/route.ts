import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { resolveUserForApi } from '@/lib/supabase/queries/sessions';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawUserId = searchParams.get('userId');
  const rawTelegramId = searchParams.get('telegram_id');

  try {
    const resolvedUser = await resolveUserForApi(rawUserId, rawTelegramId);
    const userId = resolvedUser?.id;
    const resolvedUserName = resolvedUser?.name || '';

    if (!userId) {
      return NextResponse.json({ ok: true, transactions: [], activities: [], categories: [] });
    }

    // 1. Fetch transactions
    const { data: transactions, error: txError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('occurred_at', { ascending: false });

    if (txError) throw txError;

    // 2. Fetch activities
    const { data: activities, error: actError } = await supabaseAdmin
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('occurred_at', { ascending: false });

    if (actError) throw actError;

    // 3. Fetch categories
    const { data: categories } = await supabaseAdmin
      .from('categories')
      .select('*')
      .or(`user_id.eq.${userId},is_default.eq.true`);

    // Attach short IDs
    const txWithShortIds = (transactions || []).map((t) => ({
      ...t,
      short_id: `TX-${t.id.replace(/-/g, '').substring(0, 6).toUpperCase()}`,
    }));

    const actWithShortIds = (activities || []).map((a) => ({
      ...a,
      short_id: `ACT-${a.id.replace(/-/g, '').substring(0, 6).toUpperCase()}`,
    }));

    return NextResponse.json({
      ok: true,
      userId,
      userName: resolvedUserName,
      transactions: txWithShortIds,
      activities: actWithShortIds,
      categories: categories || [],
    });
  } catch (err: any) {
    console.error('API /api/data/records GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    let { userId, telegram_id: rawTelegramId, recordId, type } = body;

    if (!recordId || !type) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const resolvedUser = await resolveUserForApi(userId, rawTelegramId);
    userId = resolvedUser?.id;

    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const table = type === 'transaction' ? 'transactions' : 'activities';
    const now = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from(table)
      .update({ deleted_at: now })
      .eq('id', recordId)
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('API /api/data/records DELETE error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { userId, telegram_id: rawTelegramId, type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const resolvedUser = await resolveUserForApi(userId, rawTelegramId);
    userId = resolvedUser?.id;

    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (type === 'transaction') {
      const parsedAmount = Number(data.amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 100_000_000_000) {
        return NextResponse.json({ error: 'Nominal transaksi tidak valid (harus angka positif)' }, { status: 400 });
      }

      const { data: newTx, error } = await supabaseAdmin
        .from('transactions')
        .insert({
          user_id: userId,
          amount: parsedAmount,
          type: data.type === 'income' ? 'income' : 'expense',
          merchant: String(data.merchant || 'Manual Dashboard').trim(),
          description: String(data.description || '').trim(),
          source: 'chat_manual',
          occurred_at: data.occurred_at || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ ok: true, record: newTx });
    } else {
      const titleStr = String(data.title || '').trim();
      if (!titleStr) {
        return NextResponse.json({ error: 'Judul aktivitas tidak boleh kosong' }, { status: 400 });
      }

      const { data: newAct, error } = await supabaseAdmin
        .from('activities')
        .insert({
          user_id: userId,
          title: titleStr,
          description: String(data.description || '').trim(),
          priority: ['low', 'medium', 'high', 'urgent'].includes(data.priority) ? data.priority : 'medium',
          status: ['scheduled', 'in_progress', 'completed', 'cancelled'].includes(data.status) ? data.status : 'scheduled',
          occurred_at: data.occurred_at || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ ok: true, record: newAct });
    }
  } catch (err: any) {
    console.error('API /api/data/records POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
