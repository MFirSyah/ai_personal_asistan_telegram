import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const khofitaUserId = 'e07667b5-336e-4275-ae06-fde7b5018b3d';
    const khofitaTelegramId = 1448236743;

    const [txs, acts, plans, debts, prefs, chats, sess, cats] = await Promise.all([
      supabaseAdmin.from('transactions').delete().eq('user_id', khofitaUserId),
      supabaseAdmin.from('activities').delete().eq('user_id', khofitaUserId),
      supabaseAdmin.from('plans').delete().eq('user_id', khofitaUserId),
      supabaseAdmin.from('debts').delete().eq('user_id', khofitaUserId),
      supabaseAdmin.from('user_preferences').delete().or(`user_id.eq.${khofitaUserId},key.eq.pengingatplankpasangan`),
      supabaseAdmin.from('chat_history').delete().eq('user_id', khofitaUserId),
      supabaseAdmin.from('sessions').delete().eq('user_id', khofitaUserId),
      supabaseAdmin.from('categories').delete().eq('user_id', khofitaUserId),
    ]);

    const userDel = await supabaseAdmin.from('users').delete().or(`id.eq.${khofitaUserId},telegram_id.eq.${khofitaTelegramId}`);

    return NextResponse.json({
      ok: true,
      message: 'Akun Khofita dan seluruh data terkait telah dihapus permanen dari sistem.',
      details: {
        txs: txs.error ? txs.error.message : 'deleted',
        acts: acts.error ? acts.error.message : 'deleted',
        plans: plans.error ? plans.error.message : 'deleted',
        debts: debts.error ? debts.error.message : 'deleted',
        prefs: prefs.error ? prefs.error.message : 'deleted',
        user: userDel.error ? userDel.error.message : 'deleted',
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
