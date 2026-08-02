import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { calculate20Analytics } from '@/lib/analytics/calculators';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
  }

  try {
    const { data: users } = await supabaseAdmin.from('users').select('id');

    if (!users || users.length === 0) {
      return NextResponse.json({ ok: true, processed: 0 });
    }

    const todayDate = new Date().toISOString().split('T')[0];
    let count = 0;

    for (const u of users) {
      const analytics = await calculate20Analytics(u.id);

      await supabaseAdmin.from('daily_insights').upsert(
        {
          user_id: u.id,
          insight_date: todayDate,
          payload: analytics,
        },
        { onConflict: 'user_id,insight_date' }
      );

      count++;
    }

    return NextResponse.json({ ok: true, processed: count });
  } catch (error: any) {
    console.error('Error generating daily insights:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
