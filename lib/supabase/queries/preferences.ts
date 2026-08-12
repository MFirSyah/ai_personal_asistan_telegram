import { supabaseAdmin } from '../client';

export interface UserPreference {
  id: string;
  user_id: string;
  key: string;
  value: string;
  learned_from?: string;
  updated_at: string;
}

export async function getUserPreferences(userId: string, limit = 15): Promise<UserPreference[]> {
  const { data, error } = await supabaseAdmin
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data as UserPreference[];
}

export async function saveUserPreference(
  userId: string,
  key: string,
  value: string,
  learnedFrom?: string
): Promise<UserPreference> {
  const cleanKey = String(key || '').replace(/[*_`]/g, '').trim();
  const cleanValue = String(value || '').replace(/[*_`]/g, '').trim();
  const cleanLearned = learnedFrom ? String(learnedFrom).replace(/[*_`]/g, '').trim() : null;

  const { data, error } = await supabaseAdmin
    .from('user_preferences')
    .upsert(
      {
        user_id: userId,
        key: cleanKey,
        value: cleanValue,
        learned_from: cleanLearned,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,key' }
    )
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to save preference: ${error?.message}`);
  }

  return data as UserPreference;
}
