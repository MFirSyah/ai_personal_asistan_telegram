import { sendTelegramMessage } from '../telegram/send-message';
import { getUserByTelegramId } from '../supabase/queries/sessions';
import { supabaseAdmin } from '../supabase/client';

export async function notifyJobProgress(
  userId: string,
  message: string
): Promise<void> {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('telegram_id')
    .eq('id', userId)
    .single();

  if (user?.telegram_id) {
    try {
      await sendTelegramMessage(user.telegram_id, message);
    } catch (err) {
      console.error(`Failed to send job progress notification to user ${userId}:`, err);
    }
  }
}
