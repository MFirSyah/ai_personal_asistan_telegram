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
    .maybeSingle();

  if (error || !data) return null;
  return data as User;
}

export async function updateUserName(userId: string, name: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ name })
    .eq('id', userId);

  if (error) {
    console.error('Failed to update user name:', error);
    return false;
  }
  return true;
}

export async function updateUserEmail(userId: string, email: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ email })
    .eq('id', userId);

  if (error) {
    console.error('Failed to update user email:', error);
    return false;
  }
  return true;
}

export async function getActiveSession(userId: string): Promise<UserSession | null> {
  const { data, error } = await supabaseAdmin
    .from('user_sessions')
    .select('*')
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString())
    .order('expires_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as UserSession;
}

export async function touchOrStartSession(userId: string): Promise<UserSession> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // +3 days

  // Fix #9: Fast single update first, fallback to insert if none found
  const { data: updated } = await supabaseAdmin
    .from('user_sessions')
    .update({
      last_active: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .eq('user_id', userId)
    .gt('expires_at', now.toISOString())
    .select()
    .limit(1)
    .maybeSingle();

  if (updated) {
    return updated as UserSession;
  }

  // Create new session if no active session existed
  const { data: newSession, error } = await supabaseAdmin
    .from('user_sessions')
    .insert({
      user_id: userId,
      last_active: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error || !newSession) {
    throw new Error(`Failed to create user session: ${error?.message}`);
  }

  return newSession as UserSession;
}

export async function resolveUserForApi(
  userId?: string | null,
  telegramId?: string | null
): Promise<{ id: string; name: string | null; telegramId: number | null } | null> {
  if (telegramId && !isNaN(Number(telegramId))) {
    const { data: userByTg } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('telegram_id', Number(telegramId))
      .maybeSingle();

    if (userByTg) return { id: userByTg.id, name: userByTg.name, telegramId: userByTg.telegram_id };
  }

  if (userId && userId !== 'demo-user' && userId.length === 36) {
    const { data: userById } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (userById) return { id: userById.id, name: userById.name, telegramId: userById.telegram_id };
  }

  return null;
}
