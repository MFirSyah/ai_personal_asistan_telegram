import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { sendTelegramMessage } from '@/lib/telegram/send-message';

export async function GET() {
  try {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
    const nowIso = now.toISOString();

    // Fetch activities scheduled or in_progress whose occurred_at time has arrived
    const { data: activeAgendas, error } = await supabaseAdmin
      .from('activities')
      .select('id, title, status, priority, occurred_at, user_id, users(telegram_id)')
      .in('status', ['scheduled', 'in_progress'])
      .gte('occurred_at', twoHoursAgo)
      .lte('occurred_at', nowIso)
      .is('deleted_at', null);

    if (error) {
      console.error('Error fetching activity cron notifications:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let notifiedCount = 0;

    for (const act of activeAgendas || []) {
      const telegramId = (act.users as any)?.telegram_id;
      if (!telegramId) continue;

      const priorityIcon = act.priority === 'urgent' ? '🚨' : act.priority === 'high' ? '⚠️' : '🔔';

      await sendTelegramMessage(
        telegramId,
        `${priorityIcon} **PENGINGAT AGENDA BERJALAN**\n\nHalo! Agenda berikut ditargetkan sedang/telah berjalan:\n📌 **${act.title}**\n\nApakah agenda ini sudah selesai kamu jalankan?`,
        {
          inline_keyboard: [
            [
              { text: '✅ Mark Selesai', callback_data: `act_complete_${act.id}` },
              { text: '⏳ Sedang Berjalan', callback_data: `act_in_progress_${act.id}` },
            ],
          ],
        }
      );
      notifiedCount++;
    }

    return NextResponse.json({
      success: true,
      notifiedCount,
    });
  } catch (err: any) {
    console.error('Activity check cron error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
