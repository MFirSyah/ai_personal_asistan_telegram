import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { generateDailyBriefing } from '@/lib/gemini/prompts/daily-briefing';
import { sendTelegramMessageBubbles, sendTelegramMessage } from '@/lib/telegram/send-message';
import { getRecentTransactions, getRecentActivities, getActivePlans } from '@/lib/supabase/queries/transactions';
import { getUserPreferences } from '@/lib/supabase/queries/preferences';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
  }

  try {
    const { data: usersWithBriefing } = await supabaseAdmin
      .from('user_settings')
      .select('user_id, briefing_time, timezone, briefing_enabled')
      .eq('briefing_enabled', true);

    if (!usersWithBriefing || usersWithBriefing.length === 0) {
      return NextResponse.json({ ok: true, processed: 0 });
    }

    let processedCount = 0;

    for (const setting of usersWithBriefing) {
      // Get user info
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', setting.user_id)
        .single();

      if (!user || !user.telegram_id) continue;

      // Get latest daily insight payload
      const { data: insight } = await supabaseAdmin
        .from('daily_insights')
        .select('payload')
        .eq('user_id', setting.user_id)
        .order('insight_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      const [yesterdayTxs, activities, plans, preferences] = await Promise.all([
        getRecentTransactions(user.id, 10),
        getRecentActivities(user.id, 50),
        getActivePlans(user.id),
        getUserPreferences(user.id, 20),
      ]);

      const briefing = await generateDailyBriefing({
        userName: user.name || 'Teman',
        insightPayload: insight?.payload || [],
        yesterdayTransactions: yesterdayTxs,
        activities,
        plans,
        preferences,
      });

      if (briefing.messages && briefing.messages.length > 0) {
        await sendTelegramMessageBubbles(user.telegram_id, briefing.messages);
      }
      if (briefing.follow_up_question) {
        await sendTelegramMessage(user.telegram_id, briefing.follow_up_question);
      }

      processedCount++;
    }

    return NextResponse.json({ ok: true, processed: processedCount });
  } catch (error: any) {
    console.error('Error in briefing cron:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
