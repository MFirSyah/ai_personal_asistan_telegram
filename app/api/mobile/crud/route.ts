import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-requested-with',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId') || 'fc2758d3-78bb-4e22-b9f0-b3b16568b671';

    const [txsRes, actRes, planRes, prefRes] = await Promise.all([
      supabaseAdmin.from('transactions').select('*').eq('user_id', userId).is('deleted_at', null).order('occurred_at', { ascending: false }).limit(50),
      supabaseAdmin.from('activities').select('*').eq('user_id', userId).is('deleted_at', null).order('start_time', { ascending: false }).limit(30),
      supabaseAdmin.from('plans').select('*').eq('user_id', userId).is('deleted_at', null).order('created_at', { ascending: false }),
      supabaseAdmin.from('user_preferences').select('*').eq('user_id', userId),
    ]);

    return NextResponse.json({
      ok: true,
      transactions: txsRes.data || [],
      activities: actRes.data || [],
      plans: planRes.data || [],
      preferences: prefRes.data || [],
    }, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;
    const safeUserId = payload?.user_id || 'fc2758d3-78bb-4e22-b9f0-b3b16568b671';

    if (!action || !payload) {
      return NextResponse.json({ error: 'Action and payload are required' }, { status: 400, headers: corsHeaders });
    }

    // --- TRANSACTIONS CRUD ---
    if (action === 'create_transaction') {
      const { amount, type, merchant, payment_method, description, occurred_at } = payload;
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .insert({
          user_id: safeUserId,
          amount: Number(amount) || 0,
          type: type || 'expense',
          merchant: merchant || 'Mobile Input',
          payment_method: payment_method || 'Cash Kertas',
          description: description || '',
          occurred_at: occurred_at || new Date().toISOString(),
          source: 'mobile_app',
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      return NextResponse.json({ ok: true, data }, { headers: corsHeaders });
    }

    if (action === 'update_transaction') {
      const { id, amount, type, merchant, payment_method, description } = payload;
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .update({
          amount: Number(amount) || 0,
          type,
          merchant,
          payment_method,
          description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      return NextResponse.json({ ok: true, data }, { headers: corsHeaders });
    }

    if (action === 'delete_transaction') {
      const { id } = payload;
      const { error } = await supabaseAdmin
        .from('transactions')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      return NextResponse.json({ ok: true }, { headers: corsHeaders });
    }

    // --- ACTIVITIES CRUD ---
    if (action === 'create_activity') {
      const { title, description, status, priority, start_time, end_time } = payload;
      const { data, error } = await supabaseAdmin
        .from('activities')
        .insert({
          user_id: safeUserId,
          title,
          description: description || '',
          status: status || 'pending',
          priority: priority || 'medium',
          start_time: start_time || new Date().toISOString(),
          end_time: end_time || null,
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      return NextResponse.json({ ok: true, data }, { headers: corsHeaders });
    }

    if (action === 'update_activity') {
      const { id, title, description, status, priority, start_time, end_time } = payload;
      const { data, error } = await supabaseAdmin
        .from('activities')
        .update({
          title,
          description,
          status,
          priority,
          start_time,
          end_time,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      return NextResponse.json({ ok: true, data }, { headers: corsHeaders });
    }

    if (action === 'delete_activity') {
      const { id } = payload;
      const { error } = await supabaseAdmin
        .from('activities')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      return NextResponse.json({ ok: true }, { headers: corsHeaders });
    }

    // --- PLANS CRUD ---
    if (action === 'create_plan') {
      const { title, target_amount, current_amount, deadline, category } = payload;
      const { data, error } = await supabaseAdmin
        .from('plans')
        .insert({
          user_id: safeUserId,
          title,
          target_amount: Number(target_amount) || 0,
          current_amount: Number(current_amount) || 0,
          deadline: deadline || null,
          category: category || 'Saving',
          status: 'active',
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      return NextResponse.json({ ok: true, data }, { headers: corsHeaders });
    }

    if (action === 'delete_plan') {
      const { id } = payload;
      const { error } = await supabaseAdmin
        .from('plans')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      return NextResponse.json({ ok: true }, { headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400, headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}
