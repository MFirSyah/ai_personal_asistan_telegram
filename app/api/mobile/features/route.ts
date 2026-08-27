import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-requested-with',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, payload } = body;
    const safeUserId = userId || 'fc2758d3-78bb-4e22-b9f0-b3b16568b671';

    // 1. SPLIT BILL GENERATOR ENGINE
    if (action === 'generate_split_bill') {
      const { totalAmount, members, description } = payload;
      const memberList = Array.isArray(members) && members.length > 0 ? members : ['Mas Firman', 'Teman 1', 'Teman 2'];
      const numMembers = memberList.length;
      const total = Number(totalAmount) || 0;
      const perPerson = Math.ceil(total / numMembers);

      const details = memberList.map((m: string) => ({
        name: m,
        amount: perPerson,
        status: m.toLowerCase().includes('firman') ? 'paid' : 'unpaid'
      }));

      const waText = `*TAGIHAN PATUNGAN: ${description || 'Makan / Keperluan Bersama'}*\n` +
        `Total: Rp ${total.toLocaleString('id-ID')}\n` +
        `Bagi ${numMembers} orang: *Rp ${perPerson.toLocaleString('id-ID')} / orang*\n\n` +
        `Rincian:\n` +
        memberList.map((m: string, i: number) => `${i + 1}. ${m}: Rp ${perPerson.toLocaleString('id-ID')}`).join('\n') +
        `\n\nSilakan transfer ke:\n` +
        `• Gopay: 081234567890 (Firman)\n` +
        `• Bank Jago: 1084842050 (M. Firman)\n` +
        `_Terima kasih banyak!_`;

      return NextResponse.json({
        ok: true,
        total,
        perPerson,
        numMembers,
        details,
        waText
      }, { headers: corsHeaders });
    }

    // 2. EARLY REPAYMENT SIMULATION ENGINE (BANK JAGO)
    if (action === 'calculate_early_repayment') {
      const { principalRemaining, monthlyInstallment, remainingMonths } = payload;
      const principal = Number(principalRemaining) || 747340;
      const monthly = Number(monthlyInstallment) || 67940;
      const months = Number(remainingMonths) || 11;

      const totalNormalPayment = monthly * months;
      const totalEarlyPayment = principal;
      const interestSaved = Math.max(0, totalNormalPayment - totalEarlyPayment);

      return NextResponse.json({
        ok: true,
        principalRemaining: principal,
        totalNormalPayment,
        totalEarlyPayment,
        interestSaved,
        remainingMonths: months,
        summary: `Pelunasan dini menghemat total bunga sebesar Rp ${interestSaved.toLocaleString('id-ID')} dari ${months} sisa cicilan.`
      }, { headers: corsHeaders });
    }

    // 3. CHECKLIST STATE PERSISTENCE
    if (action === 'save_checklist_state') {
      const { checklistKey, items } = payload;
      await supabaseAdmin
        .from('user_preferences')
        .upsert({
          user_id: safeUserId,
          key: checklistKey || 'DIENG_CHECKLIST_STATE',
          value: JSON.stringify(items),
          learned_from: 'interactive_chat_checklist',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,key' });

      return NextResponse.json({ ok: true, message: 'Checklist berhasil disimpan!' }, { headers: corsHeaders });
    }

    // 4. ODOMETER & MOTOR LOGBOOK ENGINE
    if (action === 'update_odometer') {
      const { currentKm, serviceType, cost } = payload;
      const km = Number(currentKm) || 32500;
      const nextServiceKm = km + 2500;

      await supabaseAdmin
        .from('user_preferences')
        .upsert({
          user_id: safeUserId,
          key: 'HONDA_BEAT_ODOMETER',
          value: JSON.stringify({ currentKm: km, nextServiceKm, lastUpdated: new Date().toISOString() }),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,key' });

      if (cost && Number(cost) > 0) {
        await supabaseAdmin.from('transactions').insert({
          user_id: safeUserId,
          amount: Number(cost),
          type: 'expense',
          merchant: 'Bengkel AHASS / Servis Beat',
          payment_method: 'Cash Kertas',
          description: `Servis Motor Beat: ${serviceType || 'Ganti Oli Mesin & Gardan'} (KM ${km})`,
          occurred_at: new Date().toISOString()
        });
      }

      return NextResponse.json({
        ok: true,
        currentKm: km,
        nextServiceKm,
        remainingKm: 2500,
        message: `Odometer tercatat di ${km} KM. Jadwal servis berikutnya di ${nextServiceKm} KM.`
      }, { headers: corsHeaders });
    }

    // 5. DIGITAL RECEIPT GENERATOR (KWITANSI RESMI)
    if (action === 'generate_receipt_slip') {
      const { payerName, amount, forPurpose, paymentMethod } = payload;
      const serialNumber = `KW-${Date.now().toString().slice(-6)}`;
      const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

      const slipData = {
        serialNumber,
        payerName: payerName || 'Teman / Klien',
        receiverName: 'Mas Firman',
        amount: Number(amount) || 0,
        forPurpose: forPurpose || 'Pembayaran Jasa / Penggantian Kas',
        paymentMethod: paymentMethod || 'Cash Kertas',
        date: dateStr,
        status: 'LUNAS (PAID)'
      };

      return NextResponse.json({ ok: true, slip: slipData }, { headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400, headers: corsHeaders });
  } catch (error: any) {
    console.error('Features API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
