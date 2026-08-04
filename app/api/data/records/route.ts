import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let userId = searchParams.get('userId');

  try {
    // Single-Account Auto Resolution: Fallback to primary registered Telegram user if userId is demo-user or missing
    if (!userId || userId === 'demo-user') {
      const { data: primaryUser } = await supabaseAdmin
        .from('users')
        .select('id, name')
        .not('telegram_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (primaryUser) {
        userId = primaryUser.id;
      }
    }

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

    return NextResponse.json({
      ok: true,
      userId,
      transactions: transactions || [],
      activities: activities || [],
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
    let { userId, recordId, type } = body; // type: 'transaction' | 'activity'

    if (!recordId || !type) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (!userId || userId === 'demo-user') {
      const { data: primaryUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .not('telegram_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (primaryUser) userId = primaryUser.id;
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
    let { userId, type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (!userId || userId === 'demo-user') {
      const { data: primaryUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .not('telegram_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (primaryUser) userId = primaryUser.id;
    }

    if (type === 'transaction') {
      const { data: newTx, error } = await supabaseAdmin
        .from('transactions')
        .insert({
          user_id: userId,
          amount: data.amount,
          type: data.type || 'expense',
          merchant: data.merchant || 'Manual Dashboard',
          description: data.description || '',
          source: 'chat_manual',
          occurred_at: data.occurred_at || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ ok: true, record: newTx });
    } else {
      const { data: newAct, error } = await supabaseAdmin
        .from('activities')
        .insert({
          user_id: userId,
          title: data.title,
          description: data.description || '',
          priority: data.priority || 'medium',
          status: data.status || 'scheduled',
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
