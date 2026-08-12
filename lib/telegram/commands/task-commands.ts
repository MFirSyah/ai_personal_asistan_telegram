import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { sendTelegramMessage } from '@/lib/telegram/send-message';
import { completeAllActivities, getUserHabits } from '@/lib/features/habits-and-tasks';
import { markAllDebtsPaid } from '@/lib/features/smart-alerts';

export async function handleTaskCommands(
  text: string,
  chatId: number | string,
  user: { id: string; name: string | null }
): Promise<NextResponse | null> {
  // /selesaikan_semua_aktivitas
  if (text.startsWith('/selesaikan_semua_aktivitas') || text.toLowerCase().includes('selesaikan semua aktivitas')) {
    const count = await completeAllActivities(user.id);
    await sendTelegramMessage(
      chatId,
      `✅ **BATCH PROSES AKTIVITAS SELESAI!**\n\nSebanyak **${count} agenda** telah diperbarui statusnya menjadi **Completed (Selesai)**!`
    );
    return NextResponse.json({ ok: true });
  }

  // /lunas_semua_utang
  if (text.startsWith('/lunas_semua_utang') || text.toLowerCase().includes('lunas semua utang') || text.toLowerCase().includes('utang lunas semua')) {
    const count = await markAllDebtsPaid(user.id);
    await sendTelegramMessage(
      chatId,
      `💰 **BATCH PROSES HUTANG SELESAI!**\n\nSebanyak **${count} catatan hutang** telah berhasil diperbarui statusnya menjadi **Lunas (Paid)**!`
    );
    return NextResponse.json({ ok: true });
  }

  // /habit
  if (text.startsWith('/habit')) {
    const habits = await getUserHabits(user.id);
    if (!habits.length) {
      await sendTelegramMessage(chatId, 'ℹ️ Belum ada habit tracker. Kamu bisa minta AI untuk mencatat habit baru!');
    } else {
      let msg = `🔥 **HABIT TRACKER & STREAK**\n\n`;
      habits.forEach((h) => {
        msg += `• **${h.title}**: 🔥 ${h.streak_count} Hari Streak\n`;
      });
      await sendTelegramMessage(chatId, msg);
    }
    return NextResponse.json({ ok: true });
  }

  // /progress
  if (text.startsWith('/progress')) {
    const { data: latestJob } = await supabaseAdmin
      .from('batch_jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latestJob) {
      await sendTelegramMessage(chatId, 'ℹ️ Tidak ada tugas background yang pernah berjalan.');
      return NextResponse.json({ ok: true });
    }

    let jobMsg = `🔄 **STATUS PROGRESS TUGAS BACKGROUND**\n\n`;
    jobMsg += `📌 **Tipe**: ${latestJob.type}\n`;
    jobMsg += `STATUS: ${latestJob.status.toUpperCase()}\n`;
    jobMsg += `📊 **Progress**: ${latestJob.processed_items} / ${latestJob.total_items} item\n`;

    if (latestJob.error_message) {
      jobMsg += `⚠️ **Error**: ${latestJob.error_message}\n`;
    }

    await sendTelegramMessage(chatId, jobMsg);
    return NextResponse.json({ ok: true });
  }

  return null;
}
