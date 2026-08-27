import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { sendTelegramMessage } from '@/lib/telegram/send-message';

export async function POST(req: NextRequest) {
  try {
    const { email, telegramId, name } = await req.json();

    if (!email || !telegramId) {
      return NextResponse.json({ error: 'Missing email or telegramId' }, { status: 400 });
    }

    const numericTelegramId = Number(telegramId);
    if (isNaN(numericTelegramId)) {
      return NextResponse.json({ error: 'Invalid telegramId format' }, { status: 400 });
    }

    // Upsert into public.users table linking email and telegram_id
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .update({
          telegram_id: numericTelegramId,
          name: name || existingUser.name || email.split('@')[0],
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (error) throw error;
            // Send Instant Reconnection Telegram Message
      try {
        await sendTelegramMessage(
          numericTelegramId,
          `🎉 **SELAMAT DATANG KEMBALI, MAS FIRMAN!**\n\nNomor/Akun Telegram baru Anda telah berhasil diverifikasi dan terhubung 100% ke akun Supabase resmi Anda.\n\nSeluruh data transaksi, saldo keuangan, catatan dompet, dan jadwal aktivitas Anda siap digunakan seperti biasa! 🫡💼📊📱`
        );
      } catch (tgErr) {
        console.warn('Failed sending welcome telegram message:', tgErr);
      }

      return NextResponse.json({ ok: true, user: data });
    }

    // Insert new user record
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        telegram_id: numericTelegramId,
        name: name || email.split('@')[0],
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, user: data });
  } catch (error: any) {
    console.error('Error linking Telegram account:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
