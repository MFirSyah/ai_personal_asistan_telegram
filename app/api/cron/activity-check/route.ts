import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { sendTelegramMessage } from '@/lib/telegram/send-message';

export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    // Broad window: check items scheduled in the last 4 hours up to now
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString();
    const nowIso = now.toISOString();

    // Fetch activities scheduled or in_progress whose occurred_at time has arrived
    const { data: activeAgendas, error } = await supabaseAdmin
      .from('activities')
      .select('id, title, status, priority, occurred_at, user_id, notification_sent')
      .in('status', ['scheduled', 'in_progress'])
      .gte('occurred_at', fourHoursAgo)
      .lte('occurred_at', nowIso)
      .is('deleted_at', null);

    if (error) {
      console.error('Error fetching activity cron notifications:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let notifiedCount = 0;

    for (const act of activeAgendas || []) {
      // Skip if notification already sent
      if (act.notification_sent) continue;

      // Separate query for telegram_id (avoids FK dependency)
      const { data: userRow } = await supabaseAdmin
        .from('users')
        .select('telegram_id')
        .eq('id', act.user_id)
        .maybeSingle();

      const telegramId = userRow?.telegram_id;
      if (!telegramId) continue;

      const priorityIcon = act.priority === 'urgent' ? '🚨' : act.priority === 'high' ? '⚠️' : '⏰';

      await sendTelegramMessage(
        telegramId,
        `${priorityIcon} **PENGINGAT AGENDA TERJADWAL**\n\nHalo! Waktu untuk agenda berikut telah tiba:\n📌 **${act.title}**\n\nApakah kegiatan ini sudah selesai atau sedang kamu jalankan?`,
        {
          inline_keyboard: [
            [
              { text: '✅ Mark Selesai', callback_data: `act_complete_${act.id}` },
              { text: '⏳ Sedang Berjalan', callback_data: `act_in_progress_${act.id}` },
            ],
          ],
        }
      );

      // Mark notification_sent = true
      try {
        await supabaseAdmin
          .from('activities')
          .update({ notification_sent: true })
          .eq('id', act.id);
      } catch (updErr) {
        console.error('Failed to update notification_sent:', updErr);
      }

      notifiedCount++;
    }

    return NextResponse.json({
      success: true,
      notifiedCount,
      checkedAt: nowIso,
    });
  } catch (err: any) {
    console.error('Activity check cron error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
