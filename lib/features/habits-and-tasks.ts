import { supabaseAdmin } from '../supabase/client';

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  frequency: string;
  streak_count: number;
  last_completed_at?: string;
}

export async function addHabit(userId: string, title: string, frequency = 'daily'): Promise<Habit> {
  const { data, error } = await supabaseAdmin
    .from('habits')
    .insert({
      user_id: userId,
      title,
      frequency,
      streak_count: 0,
    })
    .select()
    .single();

  if (error || !data) throw new Error(`Habit insert failed: ${error?.message}`);
  return data as Habit;
}

export async function checkInHabit(userId: string, habitId: string): Promise<Habit> {
  const { data: habit } = await supabaseAdmin.from('habits').select('*').eq('id', habitId).eq('user_id', userId).single();
  if (!habit) throw new Error('Habit not found');

  const newStreak = (habit.streak_count || 0) + 1;
  const { data, error } = await supabaseAdmin
    .from('habits')
    .update({
      streak_count: newStreak,
      last_completed_at: new Date().toISOString(),
    })
    .eq('id', habitId)
    .select()
    .single();

  if (error || !data) throw new Error(`Habit check-in failed: ${error?.message}`);
  return data as Habit;
}

export async function getUserHabits(userId: string): Promise<Habit[]> {
  const { data } = await supabaseAdmin.from('habits').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return (data || []) as Habit[];
}

export function generateICalendarFile(title: string, description: string, startDateIso: string): { buffer: Buffer; filename: string } {
  const start = new Date(startDateIso);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration

  const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AI Personal Assistant Telegram//ID',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `DTSTART:${formatDate(start)}`,
    `DTEND:${formatDate(end)}`,
    `STATUS:CONFIRMED`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const filename = `Agenda_${title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
  return {
    buffer: Buffer.from(icsContent, 'utf-8'),
    filename,
  };
}

export async function completeAllActivities(userId: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('activities')
    .update({ status: 'completed' })
    .eq('user_id', userId)
    .neq('status', 'completed')
    .is('deleted_at', null)
    .select('id');

  if (error) throw error;
  return data?.length || 0;
}
