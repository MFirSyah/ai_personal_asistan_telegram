import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { calculate20Analytics } from '@/lib/analytics/calculators';
import { verifyApiUser } from '@/lib/auth/verify-auth';

export async function GET(req: NextRequest) {
  const { authenticated, user, errorResponse } = await verifyApiUser(req);
  if (!authenticated || !user) {
    return errorResponse || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.id;
  const { searchParams } = new URL(req.url);
  const isForce = searchParams.get('force') === 'true';

  try {
    const today = new Date().toISOString().split('T')[0];

    // Check cached daily insight if force parameter is not requested
    if (!isForce) {
      const { data: cachedInsight } = await supabaseAdmin
        .from('daily_insights')
        .select('payload')
        .eq('user_id', userId)
        .eq('insight_date', today)
        .maybeSingle();

      if (cachedInsight?.payload && Array.isArray(cachedInsight.payload) && cachedInsight.payload.length > 0) {
        return NextResponse.json({
          cached: true,
          date: today,
          userId,
          insights: cachedInsight.payload,
        });
      }
    }

    // Calculate live analytics if no cache or force=true requested
    const liveAnalytics = await calculate20Analytics(userId);

    // Sync cache to daily_insights asynchronously
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
