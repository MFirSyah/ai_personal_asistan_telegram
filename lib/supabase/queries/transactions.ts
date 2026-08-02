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
