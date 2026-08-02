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

  try {
    // Check cached daily insight first
    const { data: cached } = await supabaseAdmin
      .from('daily_insights')
      .select('payload, insight_date')
      .eq('user_id', userId)
      .order('insight_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cached?.payload) {
      return NextResponse.json({
        cached: true,
        date: cached.insight_date,
        insights: cached.payload,
      });
    }

    // Fallback: calculate live
    const liveAnalytics = await calculate20Analytics(userId);
    return NextResponse.json({
      cached: false,
      date: new Date().toISOString().split('T')[0],
      insights: liveAnalytics,
    });
  } catch (error: any) {
    console.error('Error fetching analytics summary:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
