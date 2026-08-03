import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { calculate20Analytics } from '@/lib/analytics/calculators';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
  }

  // Basic validation of userId format
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
  if (!isUuid && userId !== 'demo-user') {
    return NextResponse.json({ error: 'Invalid userId format' }, { status: 400 });
  }

  const forceRefresh = searchParams.get('forceRefresh') === 'true';

  try {
    // Calculate live analytics directly to guarantee real-time accuracy matching Telegram
    const liveAnalytics = await calculate20Analytics(userId);
    const today = new Date().toISOString().split('T')[0];

    // Async cache update to daily_insights
    supabaseAdmin
      .from('daily_insights')
      .upsert(
        {
          user_id: userId,
          insight_date: today,
          payload: liveAnalytics,
        },
        { onConflict: 'user_id,insight_date' }
      )
      .then(() => {})
      .catch((err) => console.error('Cache update error:', err));

    return NextResponse.json({
      cached: false,
      date: today,
      insights: liveAnalytics,
    });
  } catch (error: any) {
    console.error('Error fetching analytics summary:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
