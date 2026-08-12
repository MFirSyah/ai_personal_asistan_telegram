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

    // 4. Fetch user profile & settings
    const { data: userProfile } = await supabaseAdmin.from('users').select('email, name').eq('id', userId).maybeSingle();
    const { data: userSetting } = await supabaseAdmin.from('user_settings').select('*').eq('user_id', userId).maybeSingle();

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
      userName: userProfile?.name || resolvedUserName,
      userEmail: userProfile?.email || '',
      briefingEnabled: userSetting ? Boolean(userSetting.briefing_enabled) : true,
      emailBriefingEnabled: userSetting ? Boolean(userSetting.email_briefing_enabled) : true,
      briefingTime: userSetting?.briefing_time || '07:00',
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
          category_id: data.category_id || null,
          source: 'chat_manual',
          occurred_at: data.occurred_at || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      const recordWithShortId = {
        ...newTx,
        short_id: `TX-${newTx.id.replace(/-/g, '').substring(0, 6).toUpperCase()}`,
      };
      return NextResponse.json({ ok: true, record: recordWithShortId });
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
      const recordWithShortId = {
        ...newAct,
        short_id: `ACT-${newAct.id.replace(/-/g, '').substring(0, 6).toUpperCase()}`,
      };
      return NextResponse.json({ ok: true, record: recordWithShortId });
    }
  } catch (err: any) {
    console.error('API /api/data/records POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    let { userId, telegram_id: rawTelegramId, recordId, type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const resolvedUser = await resolveUserForApi(userId, rawTelegramId);
    userId = resolvedUser?.id;

    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (type === 'user_profile') {
      if (data.name !== undefined) {
        await supabaseAdmin.from('users').update({ name: String(data.name).trim() }).eq('id', userId);
      }
      if (data.email !== undefined) {
        await supabaseAdmin.from('users').update({ email: String(data.email).trim() }).eq('id', userId);
      }

      await supabaseAdmin.from('user_settings').upsert({
        user_id: userId,
        briefing_enabled: data.briefing_enabled !== undefined ? Boolean(data.briefing_enabled) : true,
        email_briefing_enabled: data.email_briefing_enabled !== undefined ? Boolean(data.email_briefing_enabled) : true,
        briefing_time: data.briefing_time || '07:00:00',
        updated_at: new Date().toISOString(),
      });

      return NextResponse.json({ ok: true, message: 'Profile updated' });
    }

    const table = type === 'transaction' ? 'transactions' : 'activities';
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (type === 'transaction') {
      if (data.amount !== undefined) {
        const parsedAmount = Number(data.amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          return NextResponse.json({ error: 'Nominal transaksi harus berupa angka positif' }, { status: 400 });
        }
        updatePayload.amount = parsedAmount;
      }
      if (data.merchant !== undefined) updatePayload.merchant = String(data.merchant).trim();
      if (data.description !== undefined) updatePayload.description = String(data.description).trim();
      if (data.type !== undefined) updatePayload.type = data.type === 'income' ? 'income' : 'expense';
      if (data.category_id !== undefined) updatePayload.category_id = data.category_id || null;
      if (data.occurred_at !== undefined) updatePayload.occurred_at = data.occurred_at;
    } else {
      if (data.title !== undefined) {
        const titleStr = String(data.title).trim();
        if (!titleStr) return NextResponse.json({ error: 'Judul aktivitas tidak boleh kosong' }, { status: 400 });
        updatePayload.title = titleStr;
      }
      if (data.description !== undefined) updatePayload.description = String(data.description).trim();
      if (data.priority !== undefined) {
        updatePayload.priority = ['low', 'medium', 'high', 'urgent'].includes(data.priority) ? data.priority : 'medium';
      }
      if (data.status !== undefined) {
        updatePayload.status = ['scheduled', 'in_progress', 'completed', 'cancelled'].includes(data.status) ? data.status : 'scheduled';
      }
      if (data.occurred_at !== undefined) updatePayload.occurred_at = data.occurred_at;
    }

    const { data: updatedRecord, error } = await supabaseAdmin
      .from(table)
      .update(updatePayload)
      .eq('id', recordId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    const prefix = type === 'transaction' ? 'TX' : 'ACT';
    const recordWithShortId = {
      ...updatedRecord,
      short_id: `${prefix}-${updatedRecord.id.replace(/-/g, '').substring(0, 6).toUpperCase()}`,
    };

    return NextResponse.json({ ok: true, record: recordWithShortId });
  } catch (err: any) {
    console.error('API /api/data/records PATCH error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

