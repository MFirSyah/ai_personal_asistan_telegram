import { supabaseAdmin } from '../supabase/client';

export interface SharedGoal {
  id: string;
  user_id: string;
  partner_user_id?: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  category?: string;
  status: 'active' | 'reached' | 'cancelled';
  created_at?: string;
}

export interface Anniversary {
  id: string;
  user_id: string;
  title: string;
  event_date: string;
  reminder_days_before: number;
  notes?: string;
}

export async function linkPartnerAccounts(userId: string, partnerTelegramIdOrName: string): Promise<{ ok: boolean; message: string }> {
  const { data: partner } = await supabaseAdmin
    .from('users')
    .select('id, name')
    .or(`name.ilike.%${partnerTelegramIdOrName}%,telegram_id.eq.${partnerTelegramIdOrName}`)
    .maybeSingle();

  if (!partner) {
    return { ok: false, message: `❌ Akun pasangan dengan identifier "${partnerTelegramIdOrName}" tidak ditemukan. Pastikan pasangan kamu sudah registrasi & klik /start di bot ini!` };
  }

  await supabaseAdmin.from('users').update({ partner_user_id: partner.id }).eq('id', userId);
  await supabaseAdmin.from('users').update({ partner_user_id: userId }).eq('id', partner.id);

  return { ok: true, message: `💖 **AKUN BERHASIL DIHUBUNGKAN!**\nKamu dan **${partner.name || 'Pasanganmu'}** kini resmi terhubung untuk impian & anggaran bersama!` };
}

export async function createSharedGoal(userId: string, title: string, targetAmount: number, targetDate?: string): Promise<SharedGoal> {
  const { data: user } = await supabaseAdmin.from('users').select('partner_user_id').eq('id', userId).single();
  const partnerId = user?.partner_user_id || undefined;

  const { data, error } = await supabaseAdmin
    .from('shared_goals')
    .insert({
      user_id: userId,
      partner_user_id: partnerId,
      title,
      target_amount: targetAmount,
      current_amount: 0,
      target_date: targetDate || null,
      status: 'active',
    })
    .select()
    .single();

  if (error || !data) throw new Error(`Failed to create shared goal: ${error?.message}`);
  return data as SharedGoal;
}

export async function getSharedGoals(userId: string): Promise<SharedGoal[]> {
  const { data: user } = await supabaseAdmin.from('users').select('partner_user_id').eq('id', userId).single();
  const partnerId = user?.partner_user_id;

  let query = supabaseAdmin.from('shared_goals').select('*');
  if (partnerId) {
    query = query.or(`user_id.eq.${userId},partner_user_id.eq.${userId},user_id.eq.${partnerId},partner_user_id.eq.${partnerId}`);
  } else {
    query = query.eq('user_id', userId);
  }

  const { data } = await query.order('created_at', { ascending: false });
  return (data || []) as SharedGoal[];
}
