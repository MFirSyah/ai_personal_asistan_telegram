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
  const { data: existing, error: findError } = await supabaseAdmin
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .eq('key', key)
    .maybeSingle();

  if (findError) {
    throw new Error(`Failed to query preference: ${findError.message}`);
  }

  let resultData;

  if (existing) {
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('user_preferences')
      .update({
        value,
        learned_from: learnedFrom || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (updateError || !updated) {
      throw new Error(`Failed to update preference: ${updateError?.message}`);
    }
    resultData = updated;
  } else {
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('user_preferences')
      .insert({
        user_id: userId,
        key,
        value,
        learned_from: learnedFrom || null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError || !inserted) {
      throw new Error(`Failed to insert preference: ${insertError?.message}`);
    }
    resultData = inserted;
  }

  return resultData as UserPreference;
}
