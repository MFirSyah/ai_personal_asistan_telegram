import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch Users List
    const { data: usersList } = await supabaseAdmin
      .from('users')
      .select('id, name, email, telegram_id, created_at');

    const users = usersList || [];
    const userMap = new Map<string, string>();
    users.forEach((u) => {
      userMap.set(u.id, u.name || u.email || `User ${u.id.substring(0, 6)}`);
    });

    // 2. Fetch All Transactions
    const { data: txs, error: txErr } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .order('occurred_at', { ascending: false });

    if (txErr) {
      return NextResponse.json({ error: txErr.message }, { status: 500 });
    }

    const allTxs = txs || [];
    const activeTxs = allTxs.filter((t) => !t.deleted_at);
    const deletedTxs = allTxs.filter((t) => t.deleted_at);

    let totalIncome = 0;
    let totalExpense = 0;
    const missingMerchant: string[] = [];
    const missingDate: string[] = [];

    activeTxs.forEach((t) => {
      const amt = Number(t.amount || 0);
      if (t.type === 'income') totalIncome += amt;
      if (t.type === 'expense') totalExpense += amt;

      if (!t.merchant) missingMerchant.push(`TX [${t.id.slice(0, 8)}]`);
      if (!t.occurred_at) missingDate.push(`TX [${t.id.slice(0, 8)}]`);
    });

    const netBalance = totalIncome - totalExpense;

    // 3. Fetch All Activities
    const { data: acts } = await supabaseAdmin
      .from('activities')
      .select('*')
      .order('occurred_at', { ascending: false });

    const allActs = acts || [];
    const activeActs = allActs.filter((a) => !a.deleted_at);
    const completedActs = activeActs.filter((a) => a.status === 'completed');
    const scheduledActs = activeActs.filter((a) => a.status === 'scheduled');
    const urgentActs = activeActs.filter((a) => a.priority === 'urgent' || a.priority === 'high');

    // 4. User Preferences Audit
    const { data: prefs } = await supabaseAdmin.from('user_preferences').select('*');

    // 5. Categories Audit
    const { data: cats } = await supabaseAdmin.from('categories').select('*');

    const auditReport = {
      timestamp: new Date().toISOString(),
      transactionsSummary: {
        totalRecords: allTxs.length,
        activeRecords: activeTxs.length,
        deletedRecords: deletedTxs.length,
        totalIncome,
        totalExpense,
        netBalance,
        dataQualityCheck: {
          missingMerchantCount: missingMerchant.length,
          missingDateCount: missingDate.length,
          is100PercentValid: missingMerchant.length === 0 && missingDate.length === 0,
        },
        allTransactions: allTxs.map((t) => ({
          id: `TX-${t.id.replace(/-/g, '').substring(0, 6).toUpperCase()}`,
          rawId: t.id,
          userId: t.user_id,
          userName: userMap.get(t.user_id) || 'Mas Firman / Mbak Khofita',
          date: t.occurred_at,
          type: t.type,
          amount: Number(t.amount),
          merchant: t.merchant || '-',
          paymentMethod: t.payment_method || '-',
          description: t.description || '-',
          deletedAt: t.deleted_at,
        })),
      },
      activitiesSummary: {
        totalRecords: allActs.length,
        activeRecords: activeActs.length,
        completedCount: completedActs.length,
        scheduledCount: scheduledActs.length,
        urgentCount: urgentActs.length,
        allActivities: allActs.map((a) => ({
          id: `ACT-${a.id.replace(/-/g, '').substring(0, 6).toUpperCase()}`,
          rawId: a.id,
          userId: a.user_id,
          userName: userMap.get(a.user_id) || 'Mas Firman / Mbak Khofita',
          date: a.occurred_at,
          title: a.title,
          status: a.status,
          priority: a.priority,
          deletedAt: a.deleted_at,
        })),
      },
      userPreferences: (prefs || []).map((p) => ({
        raw: p,
        userId: p.user_id,
        userName: userMap.get(p.user_id) || 'Mas Firman / Mbak Khofita',
        key: p.key || p.preference_key || 'unknown',
        value: p.value || p.preference_value || '-',
        learnedFrom: p.learned_from || p.context || '-',
        updatedAt: p.updated_at || p.created_at,
      })),
      categories: cats || [],
      categoriesCount: (cats || []).length,
      usersList: users.map((u) => ({
        id: u.id,
        name: u.name || 'Mas Firman / Mbak Khofita',
        email: u.email,
        telegramId: u.telegram_id,
        createdAt: u.created_at,
      })),
    };

    return NextResponse.json(auditReport);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
