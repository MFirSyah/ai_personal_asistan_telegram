import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { generateDailyBriefing } from '@/lib/gemini/prompts/daily-briefing';
import { sendTelegramMessageBubbles, sendTelegramMessage } from '@/lib/telegram/send-message';
import { getRecentTransactions, getRecentActivities, getActivePlans } from '@/lib/supabase/queries/transactions';
import { getUserPreferences } from '@/lib/supabase/queries/preferences';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isForce = searchParams.get('force') === 'true';

  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!isForce && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
  }

  try {
    // 1. Get current date in WIB (Asia/Jakarta)
    const nowWib = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const currentHour = nowWib.getHours();
    const todayDateStr = `${nowWib.getFullYear()}-${String(nowWib.getMonth() + 1).padStart(2, '0')}-${String(nowWib.getDate()).padStart(2, '0')}`;

    // 2. Fetch ALL registered users who have a Telegram ID
    const { data: allUsers, error: usersErr } = await supabaseAdmin
      .from('users')
      .select('id, name, telegram_id')
      .not('telegram_id', 'is', null);

    if (usersErr || !allUsers || allUsers.length === 0) {
      return NextResponse.json({ ok: true, processed: 0, reason: 'No users with Telegram ID found' });
    }

    // 3. Fetch user_settings for settings overrides
    const { data: allSettings } = await supabaseAdmin
      .from('user_settings')
      .select('user_id, briefing_time, briefing_enabled, last_briefing_date');

    const settingsMap = new Map<string, any>();
    (allSettings || []).forEach((s) => settingsMap.set(s.user_id, s));

    let processedCount = 0;

    for (const user of allUsers) {
      if (!user.telegram_id) continue;

      const userSetting = settingsMap.get(user.id);
      const isEnabled = userSetting ? Boolean(userSetting.briefing_enabled) : true; // Default enabled for all users
      const lastSentDate = userSetting?.last_briefing_date;

      // Skip if explicitly disabled
      if (!isEnabled) continue;

      // Skip if already sent today (unless forced)
      if (!isForce && lastSentDate === todayDateStr) {
        continue;
      }

      // Fetch context data for AI briefing
      const { data: insight } = await supabaseAdmin
        .from('daily_insights')
        .select('payload')
        .eq('user_id', user.id)
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

      // Update last_briefing_date in user_settings
      await supabaseAdmin.from('user_settings').upsert({
        user_id: user.id,
        briefing_enabled: true,
        briefing_time: userSetting?.briefing_time || '07:00:00',
        last_briefing_date: todayDateStr,
        updated_at: new Date().toISOString(),
      });

      processedCount++;
    }

    return NextResponse.json({
      ok: true,
      processed: processedCount,
      currentWibHour: currentHour,
      todayDate: todayDateStr,
    });
  } catch (error: any) {
    console.error('Error in briefing cron:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
