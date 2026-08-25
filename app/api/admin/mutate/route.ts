import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    if (!action || !payload) {
      return NextResponse.json({ error: 'Action and payload are required' }, { status: 400 });
    }

    if (action === 'update_transaction') {
      const { id, amount, type, merchant, payment_method, description, category_id } = payload;
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .update({
          amount,
          type,
          merchant,
          payment_method,
          description,
          category_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, data });
    }

    if (action === 'delete_transaction') {
      const { id } = payload;
      const { error } = await supabaseAdmin
        .from('transactions')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (action === 'restore_transaction') {
      const { id } = payload;
      const { error } = await supabaseAdmin
        .from('transactions')
        .update({ deleted_at: null })
        .eq('id', id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (action === 'create_transaction') {
      const { user_id, amount, type, merchant, payment_method, description } = payload;
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .insert({
          user_id: user_id || '00000000-0000-0000-0000-000000000001',
          amount,
          type,
          merchant: merchant || 'Admin Insert',
          payment_method: payment_method || 'Cash',
          description: description || 'Ditambahkan via Admin Panel',
          source: payload.source || 'chat_manual',
          tags: payload.tags || [],
          occurred_at: payload.occurred_at || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, data });
    }

    if (action === 'update_activity') {
      const { id, title, status, priority } = payload;
      const { data, error } = await supabaseAdmin
        .from('activities')
        .update({
          title,
          status,
          priority,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, data });
    }

    if (action === 'delete_activity') {
      const { id } = payload;
      const { error } = await supabaseAdmin
        .from('activities')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (action === 'restore_activity') {
      const { id } = payload;
      const { error } = await supabaseAdmin
        .from('activities')
        .update({ deleted_at: null })
        .eq('id', id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
