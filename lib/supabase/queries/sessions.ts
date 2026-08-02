import { supabaseAdmin } from '../client';

export interface UserSession {
  id: string;
  user_id: string;
  last_active: string;
  expires_at: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  telegram_id: number | null;
  name: string | null;
  created_at: string;
}

export async function getUserByTelegramId(telegramId: number): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();

  if (error || !data) return null;
  return data as User;
}

export async function getActiveSession(userId: string): Promise<UserSession | null> {
  const { data, error } = await supabaseAdmin
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString())
    .order('expires_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data as UserSession;
}

export async function touchOrStartSession(userId: string): Promise<UserSession> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // +3 days

  const existingSession = await getActiveSession(userId);

  if (existingSession) {
    const { data, error } = await supabaseAdmin
      .from('user_sessions')
      .update({
        last_active: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq('id', existingSession.id)
      .select()
      .single();

    if (!error && data) return data as UserSession;
  }

  // Create new session
  const { data, error } = await supabaseAdmin
    .from('user_sessions')
    .insert({
      user_id: userId,
      last_active: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create user session: ${error?.message}`);
  }

  return data as UserSession;
}
