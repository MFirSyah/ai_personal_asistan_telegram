import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { verifyApiUser } from '@/lib/auth/verify-auth';
import { getUserSubscriptions, getUserDebts, getUserInstallments } from '@/lib/features/smart-alerts';
import { sendBriefingEmail } from '@/lib/email/send-briefing-email';

export async function GET(req: NextRequest) {
  const { authenticated, user, errorResponse } = await verifyApiUser(req);
  if (!authenticated || !user) {
    return errorResponse || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.id;
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(200, Math.max(10, parseInt(searchParams.get('limit') || '50', 10)));
  const search = (searchParams.get('search') || '').trim();
  const recordType = searchParams.get('type') || 'all';

  try {
    // 1. Transactions Query
    let txQuery = supabaseAdmin
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('occurred_at', { ascending: false });

    if (search) {
      txQuery = txQuery.or(`description.ilike.%${search}%,merchant.ilike.%${search}%`);
    }

    if (recordType === 'transaction' || recordType === 'all') {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      txQuery = txQuery.range(from, to);
    }

    const { data: transactions, count: txTotalCount, error: txError } = await txQuery;
    if (txError) throw txError;

    // 2. Activities Query
    let actQuery = supabaseAdmin
      .from('activities')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('occurred_at', { ascending: false });

    if (search) {
      actQuery = actQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (recordType === 'activity' || recordType === 'all') {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      actQuery = actQuery.range(from, to);
    }

    const { data: activities, count: actTotalCount, error: actError } = await actQuery;
    if (actError) throw actError;

    // 3. Subscriptions, Debts, Installments & Categories
    const [subs, debts, insts, { data: categories }] = await Promise.all([
      getUserSubscriptions(userId),
      getUserDebts(userId),
      getUserInstallments(userId),
      supabaseAdmin.from('categories').select('*').or(`user_id.eq.${userId},is_default.eq.true`),
    ]);

    const { data: userProfile } = await supabaseAdmin.from('users').select('email, name').eq('id', userId).maybeSingle();
    const { data: userSetting } = await supabaseAdmin.from('user_settings').select('*').eq('user_id', userId).maybeSingle();

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
      userName: userProfile?.name || user.name || '',
      userEmail: userProfile?.email || '',
      briefingEnabled: userSetting ? Boolean(userSetting.briefing_enabled) : true,
      briefingTime: userSetting?.briefing_time || '07:00',
      transactions: txWithShortIds,
      activities: actWithShortIds,
      subscriptions: subs || [],
      debts: debts || [],
      installments: insts || [],
      categories: categories || [],
      pagination: {
        page,
        limit,
        totalTransactions: txTotalCount || 0,
        totalActivities: actTotalCount || 0,
        totalPagesTransactions: Math.ceil((txTotalCount || 0) / limit),
        totalPagesActivities: Math.ceil((actTotalCount || 0) / limit),
      },
    });
  } catch (err: any) {
    console.error('API /api/data/records GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { authenticated, user, errorResponse } = await verifyApiUser(req);
  if (!authenticated || !user) {
    return errorResponse || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { recordId, type } = body;

    if (!recordId || !type) {
      return NextResponse.json({ error: 'Missing required parameters (recordId, type)' }, { status: 400 });
    }

    const table = type === 'transaction' ? 'transactions' : 'activities';
    const now = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from(table)
      .update({ deleted_at: now })
      .eq('id', recordId)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('API /api/data/records DELETE error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { authenticated, user, errorResponse } = await verifyApiUser(req);
  if (!authenticated || !user) {
    return errorResponse || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (type === 'transaction') {
      const parsedAmount = Number(data.amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 100_000_000_000) {
        return NextResponse.json({ error: 'Nominal transaksi tidak valid (harus angka positif)' }, { status: 400 });
      }

      const { data: newTx, error } = await supabaseAdmin
        .from('transactions')
        .insert({
          user_id: user.id,
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
          user_id: user.id,
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
  const { authenticated, user, errorResponse } = await verifyApiUser(req);
  if (!authenticated || !user) {
    return errorResponse || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { recordId, type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (type === 'user_profile') {
      if (data.name !== undefined) {
        await supabaseAdmin.from('users').update({ name: String(data.name).trim() }).eq('id', user.id);
      }
      if (data.email !== undefined) {
        await supabaseAdmin.from('users').update({ email: String(data.email).trim() }).eq('id', user.id);
      }

      await supabaseAdmin.from('user_settings').upsert({
        user_id: user.id,
        briefing_enabled: data.briefing_enabled !== undefined ? Boolean(data.briefing_enabled) : true,
        email_briefing_enabled: data.email_briefing_enabled !== undefined ? Boolean(data.email_briefing_enabled) : true,
        briefing_time: data.briefing_time || '07:00:00',
        updated_at: new Date().toISOString(),
      });

      return NextResponse.json({ ok: true, message: 'Profile updated' });
    }

    if (type === 'test_email') {
      const targetEmail = String(data.email || '').trim();
      if (!targetEmail || !targetEmail.includes('@')) {
        return NextResponse.json({ error: 'Alamat email tidak valid untuk dites' }, { status: 400 });
      }

      // Security check: Verify targetEmail belongs to logged in user or user profile
      const { data: userProfile } = await supabaseAdmin.from('users').select('email').eq('id', user.id).single();
      const userRegEmail = userProfile?.email;

      if (userRegEmail && targetEmail.toLowerCase() !== userRegEmail.toLowerCase()) {
        return NextResponse.json({ error: 'Hanya dapat mengirim email tes ke alamat email yang terdaftar pada akun kamu' }, { status: 403 });
      }

      const testResult = await sendBriefingEmail(targetEmail, {
        userName: user.name || 'Teman',
        todayDateStr: new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        safeDailyLimit: 150000,
        totalIncome: 500000,
        totalExpense: 120000,
        todayActs: ['Tes Pengiriman Email Morning Briefing DATA_CORE_V1'],
        urgentActs: ['Pastikan email ini masuk dengan rapi di inbox kamu!'],
        aiInsight: 'Fitur ganti email & pengiriman briefing via email telah berhasil aktif di Supabase!',
      });

      if (!testResult.ok) {
        return NextResponse.json({ error: testResult.error || 'Gagal mengirim email tes' }, { status: 400 });
      }

      return NextResponse.json({ ok: true, message: `Email tes berhasil dikirim ke ${targetEmail}!`, result: testResult });
    }

    const table = type === 'transaction' ? 'transactions' : 'activities';
    const updatePayload: Record<string, any> = {};

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
      .eq('user_id', user.id)
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
