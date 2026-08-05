import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { calculate20Analytics } from '@/lib/analytics/calculators';

import { resolveUserForApi } from '@/lib/supabase/queries/sessions';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawUserId = searchParams.get('userId');
  const rawTelegramId = searchParams.get('telegram_id');

  const resolvedUser = await resolveUserForApi(rawUserId, rawTelegramId);
  const userId = resolvedUser?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
  }

  try {
    // Calculate live analytics directly to guarantee real-time accuracy matching Telegram
    const liveAnalytics = await calculate20Analytics(userId);
    const today = new Date().toISOString().split('T')[0];

    // Sync cache to daily_insights
    try {
      await supabaseAdmin.from('daily_insights').upsert(
        {
          user_id: userId,
          insight_date: today,
          payload: liveAnalytics,
        },
        { onConflict: 'user_id,insight_date' }
      );
    } catch (cacheErr) {
      console.error('Cache update error:', cacheErr);
    }

    return NextResponse.json({
      cached: false,
      date: today,
      userId,
      insights: liveAnalytics,
    });
  } catch (error: any) {
    console.error('Error fetching analytics summary:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
