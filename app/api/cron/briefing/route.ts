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

    const eligibleUsers = allUsers.filter((u) => {
      if (!u.telegram_id) return false;
      const userSetting = settingsMap.get(u.id);
      const isEnabled = userSetting ? Boolean(userSetting.briefing_enabled) : true;
      const lastSentDate = userSetting?.last_briefing_date;
      if (!isEnabled) return false;
      if (!isForce && lastSentDate === todayDateStr) return false;
      return true;
    });

    const processSingleUser = async (user: typeof allUsers[0]) => {
      const userSetting = settingsMap.get(user.id);
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

      if (briefing.messages && briefing.messages.length > 0 && user.telegram_id) {
        await sendTelegramMessageBubbles(user.telegram_id, briefing.messages);
      }
      if (briefing.follow_up_question && user.telegram_id) {
        await sendTelegramMessage(user.telegram_id, briefing.follow_up_question);
      }

      await supabaseAdmin.from('user_settings').upsert({
        user_id: user.id,
        briefing_enabled: true,
        briefing_time: userSetting?.briefing_time || '07:00:00',
        last_briefing_date: todayDateStr,
        updated_at: new Date().toISOString(),
      });
    };

    // Parallel batching in chunks of 4 users
    const chunkSize = 4;
    let processedCount = 0;

    for (let i = 0; i < eligibleUsers.length; i += chunkSize) {
      const chunk = eligibleUsers.slice(i, i + chunkSize);
      const results = await Promise.allSettled(chunk.map((u) => processSingleUser(u)));
      processedCount += results.filter((r) => r.status === 'fulfilled').length;
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
