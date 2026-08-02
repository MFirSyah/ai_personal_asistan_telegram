import { supabaseAdmin } from '../supabase/client';

export interface RateLimitCheckResult {
  allowed: boolean;
  reason?: 'minute_limit_exceeded' | 'day_limit_exceeded';
  retryAfterSeconds?: number;
}

const MINUTE_LIMIT = 7;
const DAY_LIMIT = 700;

export async function checkAndUpdateRateLimit(userId: string): Promise<RateLimitCheckResult> {
  const now = new Date();

  const { data: record } = await supabaseAdmin
    .from('rate_limits')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!record) {
    // Initial record insertion
    await supabaseAdmin.from('rate_limits').insert({
      user_id: userId,
      minute_count: 1,
      minute_window_start: now.toISOString(),
      day_count: 1,
      day_window_start: now.toISOString(),
    });

    return { allowed: true };
  }

  const minuteWindowStart = new Date(record.minute_window_start);
  const dayWindowStart = new Date(record.day_window_start);

  const minuteElapsedSec = (now.getTime() - minuteWindowStart.getTime()) / 1000;
  const dayElapsedHours = (now.getTime() - dayWindowStart.getTime()) / (1000 * 60 * 60);

  let minuteCount = record.minute_count;
  let dayCount = record.day_count;

  let newMinuteWindowStart = record.minute_window_start;
  let newDayWindowStart = record.day_window_start;

  // Reset minute window if 60 seconds passed
  if (minuteElapsedSec >= 60) {
    minuteCount = 0;
    newMinuteWindowStart = now.toISOString();
  }

  // Reset day window if 24 hours passed
  if (dayElapsedHours >= 24) {
    dayCount = 0;
    newDayWindowStart = now.toISOString();
  }

  // Check limits
  if (minuteCount >= MINUTE_LIMIT) {
    const retryAfter = Math.ceil(60 - minuteElapsedSec);
    return {
      allowed: false,
      reason: 'minute_limit_exceeded',
      retryAfterSeconds: Math.max(1, retryAfter),
    };
  }

  if (dayCount >= DAY_LIMIT) {
    return {
      allowed: false,
      reason: 'day_limit_exceeded',
    };
  }

  // Increment counters
  await supabaseAdmin
    .from('rate_limits')
    .update({
      minute_count: minuteCount + 1,
      minute_window_start: newMinuteWindowStart,
      day_count: dayCount + 1,
      day_window_start: newDayWindowStart,
    })
    .eq('user_id', userId);

  return { allowed: true };
}
