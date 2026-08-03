import { supabaseAdmin } from '../supabase/client';

export interface Subscription {
  id: string;
  user_id: string;
  service_name: string;
  amount: number;
  billing_cycle: 'monthly' | 'yearly' | 'weekly';
  next_billing_date: string;
  category?: string;
}

export interface Debt {
  id: string;
  user_id: string;
  person_name: string;
  amount: number;
  type: 'i_owe' | 'they_owe';
  due_date?: string;
  notes?: string;
  status: 'unpaid' | 'paid' | 'cancelled';
}

export async function addSubscription(userId: string, sub: Partial<Subscription>): Promise<Subscription> {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .insert({
      user_id: userId,
      service_name: sub.service_name,
      amount: sub.amount,
      billing_cycle: sub.billing_cycle || 'monthly',
      next_billing_date: sub.next_billing_date || new Date().toISOString().split('T')[0],
      category: sub.category || 'Tagihan',
    })
    .select()
    .single();

  if (error || !data) throw new Error(`Subscription insert failed: ${error?.message}`);
  return data as Subscription;
}

export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('next_billing_date', { ascending: true });

  return (data || []) as Subscription[];
}

export async function addDebt(userId: string, debt: Partial<Debt>): Promise<Debt> {
  const { data, error } = await supabaseAdmin
    .from('debts')
    .insert({
      user_id: userId,
      person_name: debt.person_name,
      amount: debt.amount,
      type: debt.type || 'they_owe',
      due_date: debt.due_date || null,
      notes: debt.notes || null,
      status: 'unpaid',
    })
    .select()
    .single();

  if (error || !data) throw new Error(`Debt insert failed: ${error?.message}`);
  return data as Debt;
}

export async function getUserDebts(userId: string): Promise<Debt[]> {
  const { data } = await supabaseAdmin
    .from('debts')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'unpaid')
    .order('created_at', { ascending: false });

  return (data || []) as Debt[];
}
