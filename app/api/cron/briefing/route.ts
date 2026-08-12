import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { generateDailyBriefing } from '@/lib/gemini/prompts/daily-briefing';
import { sendTelegramMessageBubbles, sendTelegramMessage } from '@/lib/telegram/send-message';
import { sendBriefingEmail } from '@/lib/email/send-briefing-email';
import { getRecentTransactions, getRecentActivities, getActivePlans } from '@/lib/supabase/queries/transactions';
import { getUserPreferences } from '@/lib/supabase/queries/preferences';
import { checkAndUpdateRateLimit } from '@/lib/gemini/rate-limiter';

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

    // 2. Fetch ALL registered users
    const { data: allUsers, error: usersErr } = await supabaseAdmin
      .from('users')
      .select('id, name, telegram_id, email');

    if (usersErr || !allUsers || allUsers.length === 0) {
      return NextResponse.json({ ok: true, processed: 0, reason: 'No registered users found' });
    }

    // 3. Fetch user_settings for settings overrides
    const { data: allSettings } = await supabaseAdmin
      .from('user_settings')
      .select('user_id, briefing_time, briefing_enabled, email_briefing_enabled, last_briefing_date');

    const settingsMap = new Map<string, any>();
    (allSettings || []).forEach((s) => settingsMap.set(s.user_id, s));

    const eligibleUsers = allUsers.filter((u) => {
      const userSetting = settingsMap.get(u.id);
      const isEnabled = userSetting ? Boolean(userSetting.briefing_enabled) : true;
      const lastSentDate = userSetting?.last_briefing_date;
      if (!isEnabled) return false;
      if (!isForce && lastSentDate === todayDateStr) return false;
      return true;
    });

    const processSingleUser = async (user: typeof allUsers[0]) => {
      const rateCheck = await checkAndUpdateRateLimit(user.id);
      if (!rateCheck.allowed) {
        console.warn(`Skipping daily briefing for user ${user.id} due to rate limiting.`);
        return;
      }

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

      const dispatchPromises: Promise<any>[] = [];

      // Channel 1: Telegram Bot Dispatch
      if (user.telegram_id) {
        if (briefing.messages && briefing.messages.length > 0) {
          dispatchPromises.push(sendTelegramMessageBubbles(user.telegram_id, briefing.messages));
        }
        if (briefing.follow_up_question) {
          dispatchPromises.push(sendTelegramMessage(user.telegram_id, briefing.follow_up_question));
        }
      }

      // Channel 2: Transactional Email Dispatch
      let userEmailStatus: any = null;
      const emailEnabled = userSetting ? userSetting.email_briefing_enabled !== false : true;
      if (user.email && emailEnabled) {
        const todayDateFormatted = nowWib.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        const todayActs = activities
          .filter((a) => a.status !== 'completed' && a.status !== 'cancelled')
          .slice(0, 5)
          .map((a) => a.title);

        const urgentActs = activities
          .filter((a) => (a.priority === 'urgent' || a.priority === 'high') && a.status !== 'completed')
          .map((a) => a.title);

        const safeLimit = (insight?.payload || []).find((p: any) => p.title?.includes('Sisa Uang'))?.value || 100000;

        const emailResult = await sendBriefingEmail(user.email, {
          userName: user.name || 'Teman',
          todayDateStr: todayDateFormatted,
          safeDailyLimit: typeof safeLimit === 'number' ? safeLimit : 100000,
          totalIncome: yesterdayTxs.filter((t) => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount || 0), 0),
          totalExpense: yesterdayTxs.filter((t) => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount || 0), 0),
          todayActs,
          urgentActs,
          aiInsight: briefing.follow_up_question || briefing.messages?.[0] || '',
        });
        userEmailStatus = { userId: user.id, email: user.email, ...emailResult };
      } else {
        userEmailStatus = {
          userId: user.id,
          email: user.email || 'not_set',
          ok: false,
          error: !user.email ? 'Email tidak terdaftar di Supabase DB' : 'Email briefing dinonaktifkan di pengaturan',
        };
      }

      await Promise.allSettled(dispatchPromises);

      await supabaseAdmin.from('user_settings').upsert({
        user_id: user.id,
        briefing_enabled: true,
        briefing_time: userSetting?.briefing_time || '07:00:00',
        last_briefing_date: todayDateStr,
        updated_at: new Date().toISOString(),
      });

      return userEmailStatus;
    };

    // Parallel batching in chunks of 4 users
    const chunkSize = 4;
    let processedCount = 0;
    const emailLogs: any[] = [];

    for (let i = 0; i < eligibleUsers.length; i += chunkSize) {
      const chunk = eligibleUsers.slice(i, i + chunkSize);
      const results = await Promise.allSettled(chunk.map((u) => processSingleUser(u)));
      results.forEach((r) => {
        if (r.status === 'fulfilled') {
          processedCount++;
          if (r.value) emailLogs.push(r.value);
        }
      });
    }

    return NextResponse.json({
      ok: true,
      processed: processedCount,
      currentWibHour: currentHour,
      todayDate: todayDateStr,
      emailLogs,
    });
  } catch (error: any) {
    console.error('Error in briefing cron:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
