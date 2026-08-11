import { supabaseAdmin } from '../client';

export interface Transaction {
  id: string;
  user_id: string;
  category_id?: string;
  amount: number;
  type: 'expense' | 'income';
  merchant?: string;
  description?: string;
  source: 'receipt_ocr' | 'chat_manual';
  payment_method?: string;
  location?: string;
  items?: any[];
  tags?: string[];
  raw_ai_response?: any;
  occurred_at: string;
  deleted_at?: string | null;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  category_id?: string;
  title: string;
  description?: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  occurred_at: string;
  deleted_at?: string | null;
  created_at: string;
}

export interface Plan {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_date?: string;
  status: 'planned' | 'in_progress' | 'done' | 'cancelled';
  created_at: string;
}

export interface ChatHistoryItem {
  id?: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export async function insertTransaction(tx: Partial<Transaction>): Promise<Transaction> {
  const { data, error } = await supabaseAdmin
    .from('transactions')
    .insert(tx)
    .select()
    .single();

  if (error || !data) throw new Error(`Transaction insert failed: ${error?.message}`);
  return data as Transaction;
}

export async function softDeleteTransactionByCriteria(
  userId: string,
  criteria?: { amount?: number; type?: 'expense' | 'income' }
): Promise<boolean> {
  let query = supabaseAdmin
    .from('transactions')
    .select('id')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (criteria?.amount) {
    query = query.eq('amount', criteria.amount);
  }
  if (criteria?.type) {
    query = query.eq('type', criteria.type);
  }

  const { data: matches, error: findError } = await query.limit(1);

  if (findError || !matches || matches.length === 0) {
    console.warn('No matching transaction found to soft delete:', findError);
    return false;
  }

  const targetId = matches[0].id;

  const { error: updateError } = await supabaseAdmin
    .from('transactions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', targetId);

  if (updateError) {
    console.error('Failed to soft delete transaction:', updateError);
    return false;
  }

  return true;
}

export async function insertActivity(activity: Partial<Activity>): Promise<Activity> {
  const { data, error } = await supabaseAdmin
    .from('activities')
    .insert(activity)
    .select()
    .single();

  if (error || !data) throw new Error(`Activity insert failed: ${error?.message}`);
  return data as Activity;
}

export async function insertPlan(plan: Partial<Plan>): Promise<Plan> {
  const { data, error } = await supabaseAdmin
    .from('plans')
    .insert(plan)
    .select()
    .single();

  if (error || !data) throw new Error(`Plan insert failed: ${error?.message}`);
  return data as Plan;
}

export async function getRecentTransactions(userId: string, limit = 20): Promise<Transaction[]> {
  const { data, error } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('occurred_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data as Transaction[];
}

export async function getRecentActivities(userId: string, limit = 20): Promise<Activity[]> {
  const { data, error } = await supabaseAdmin
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('occurred_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data as Activity[];
}

export async function getActivePlans(userId: string): Promise<Plan[]> {
  const { data, error } = await supabaseAdmin
    .from('plans')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['planned', 'in_progress'])
    .order('created_at', { ascending: false });

  if (error) return [];
  return data as Plan[];
}

export async function getRecentChatHistory(userId: string, limit = 10): Promise<ChatHistoryItem[]> {
  const { data, error } = await supabaseAdmin
    .from('chat_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data as ChatHistoryItem[]).reverse();
}

export async function saveChatMessage(userId: string, role: 'user' | 'assistant', content: string) {
  await supabaseAdmin.from('chat_history').insert({
    user_id: userId,
    role,
    content,
  });
}

export async function randomizeTransactionTimestamps(
  userId: string,
  targetDateStr?: string,
  startHour = 8,
  endHour = 21
): Promise<number> {
  const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();

  const { data: txs, error } = await supabaseAdmin
    .from('transactions')
    .select('id')
    .eq('user_id', userId)
    .is('deleted_at', null);

  if (error || !txs || !txs.length) return 0;

  const updates = txs.map((tx) => {
    const randomHour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
    const randomMin = Math.floor(Math.random() * 60);
    const randomSec = Math.floor(Math.random() * 60);

    const newDate = new Date(targetDate);
    newDate.setHours(randomHour, randomMin, randomSec, 0);

    return supabaseAdmin
      .from('transactions')
      .update({ occurred_at: newDate.toISOString() })
      .eq('id', tx.id);
  });

  // Batch process updates in parallel chunks of 15
  const chunkSize = 15;
  let updatedCount = 0;
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    const results = await Promise.all(chunk);
    updatedCount += results.filter((r) => !r.error).length;
  }

  return updatedCount;
}

export async function randomizeActivityTimestamps(
  userId: string,
  targetDateStr?: string,
  startHour = 8,
  endHour = 21
): Promise<number> {
  const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();

  const { data: acts, error } = await supabaseAdmin
    .from('activities')
    .select('id')
    .eq('user_id', userId)
    .is('deleted_at', null);

  if (error || !acts || !acts.length) return 0;

  const updates = acts.map((act) => {
    const randomHour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
    const randomMin = Math.floor(Math.random() * 60);
    const randomSec = Math.floor(Math.random() * 60);

    const newDate = new Date(targetDate);
    newDate.setHours(randomHour, randomMin, randomSec, 0);

    return supabaseAdmin
      .from('activities')
      .update({ occurred_at: newDate.toISOString() })
      .eq('id', act.id);
  });

  const chunkSize = 15;
  let updatedCount = 0;
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    const results = await Promise.all(chunk);
    updatedCount += results.filter((r) => !r.error).length;
  }

  return updatedCount;
}

export async function findRecordIdByShortOrFull(
  userId: string,
  idOrShortId: string,
  type: 'transaction' | 'activity'
): Promise<string | null> {
  const table = type === 'transaction' ? 'transactions' : 'activities';
  const cleanStr = idOrShortId.trim();

  // If full UUID format (36 chars)
  if (cleanStr.length === 36) {
    return cleanStr;
  }

  const hexPart = cleanStr.replace(/^(TX|ACT)-?/i, '').toLowerCase();

  // Efficient server-side query using ILIKE
  const { data: matches } = await supabaseAdmin
    .from(table)
    .select('id')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .ilike('id', `${hexPart}%`)
    .limit(1);

  if (matches && matches.length > 0) {
    return matches[0].id;
  }

  // Fallback: If hexPart stripped hyphens, check against formatted UUIDs in limit 50
  const { data: records } = await supabaseAdmin
    .from(table)
    .select('id')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .limit(50);

  if (!records || records.length === 0) return null;

  for (const r of records) {
    const rClean = r.id.replace(/-/g, '').toLowerCase();
    if (rClean.startsWith(hexPart) || r.id.toLowerCase() === cleanStr.toLowerCase()) {
      return r.id;
    }
  }

  return null;
}

export async function updateRecordById(
  userId: string,
  idOrShortId: string,
  type: 'transaction' | 'activity',
  updates: Record<string, any>
): Promise<boolean> {
  const realId = await findRecordIdByShortOrFull(userId, idOrShortId, type);
  if (!realId) return false;

  const table = type === 'transaction' ? 'transactions' : 'activities';
  const { error } = await supabaseAdmin
    .from(table)
    .update(updates)
    .eq('id', realId)
    .eq('user_id', userId);

  if (error) {
    console.error(`Failed to update ${type} ${realId}:`, error);
    return false;
  }
  return true;
}

export async function deleteRecordById(
  userId: string,
  idOrShortId: string,
  type: 'transaction' | 'activity'
): Promise<boolean> {
  const realId = await findRecordIdByShortOrFull(userId, idOrShortId, type);
  if (!realId) return false;

  const table = type === 'transaction' ? 'transactions' : 'activities';
  const { error } = await supabaseAdmin
    .from(table)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', realId)
    .eq('user_id', userId);

  if (error) {
    console.error(`Failed to delete ${type} ${realId}:`, error);
    return false;
  }
  return true;
}

