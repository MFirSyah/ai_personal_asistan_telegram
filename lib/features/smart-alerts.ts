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

export interface Installment {
  id: string;
  user_id: string;
  item_name: string;
  monthly_amount: number;
  total_months: number;
  remaining_months: number;
  due_day: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at?: string;
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
  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('next_billing_date', { ascending: true });

    if (error) return [];
    return (data || []) as Subscription[];
  } catch (err) {
    return [];
  }
}

export async function addDebt(userId: string, debt: Partial<Debt>): Promise<Debt> {
  const { data, error } = await supabaseAdmin
    .from('debts')
    .insert({
      user_id: userId,
      person_name: debt.person_name,
      amount: debt.amount,
      type: debt.type || 'they_owe',
      due_date: debt.due_date?.trim() ? debt.due_date.trim() : null,
      notes: debt.notes || null,
      status: 'unpaid',
    })
    .select()
    .single();

  if (error || !data) throw new Error(`Debt insert failed: ${error?.message}`);
  return data as Debt;
}

export async function getUserDebts(userId: string): Promise<Debt[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('debts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'unpaid')
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []) as Debt[];
  } catch (err) {
    return [];
  }
}

export async function markAllDebtsPaid(userId: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('debts')
    .update({ status: 'paid' })
    .eq('user_id', userId)
    .eq('status', 'unpaid')
    .select('id');

  if (error) throw error;
  return data?.length || 0;
}

export async function getUserInstallments(userId: string): Promise<Installment[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('installments')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('due_day', { ascending: true });

    if (error) return [];
    return (data || []) as Installment[];
  } catch (err) {
    return [];
  }
}
