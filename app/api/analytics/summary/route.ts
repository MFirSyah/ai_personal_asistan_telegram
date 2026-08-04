import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { calculate20Analytics } from '@/lib/analytics/calculators';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let userId = searchParams.get('userId');

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
