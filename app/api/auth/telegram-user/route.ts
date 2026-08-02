import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const { telegramId } = await req.json();

    if (!telegramId) {
      return NextResponse.json({ error: 'Missing telegramId' }, { status: 400 });
    }

    const numericTelegramId = Number(telegramId);
    if (isNaN(numericTelegramId)) {
      return NextResponse.json({ error: 'Invalid telegramId format' }, { status: 400 });
    }

    // Strict Check: Only return user if ALREADY manually registered/linked in database
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('telegram_id', numericTelegramId)
      .maybeSingle();

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Akun Telegram belum dihubungkan dengan akun Supabase yang terdaftar.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ ok: true, user: existingUser });
  } catch (error: any) {
    console.error('Error fetching Telegram user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
