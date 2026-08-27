import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { insertTransaction } from '@/lib/supabase/queries/transactions';
import { getUserCategories } from '@/lib/supabase/queries/categories';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'fc2758d3-78bb-4e22-b9f0-b3b16568b671';

    // 1. Fetch Wallets
    const { data: prefWallets } = await supabase
      .from('user_preferences')
      .select('value')
      .eq('user_id', userId)
      .eq('key', 'DYNAMIC_WALLETS')
      .single();

    let wallets = [
      { id: 'w-cash', name: 'Cash Kertas', icon: 'payments', balance: 152000, type: 'cash' },
      { id: 'w-coin', name: 'Cash Koin', icon: 'monetization_on', balance: 9500, type: 'cash' },
      { id: 'w-gopay', name: 'Gopay Driver', icon: 'account_balance_wallet', balance: 164000, type: 'ewallet' },
      { id: 'w-seabank', name: 'SeaBank', icon: 'account_balance', balance: 0, type: 'bank' },
      { id: 'w-jago', name: 'Bank Jago', icon: 'credit_card', balance: 0, type: 'bank' }
    ];

    if (prefWallets?.value) {
      try { wallets = JSON.parse(prefWallets.value); } catch (e) {}
    }

    // 2. Fetch Goals / Sinking Funds
    const { data: prefGoals } = await supabase
      .from('user_preferences')
      .select('value')
      .eq('user_id', userId)
      .eq('key', 'DYNAMIC_GOALS')
      .single();

    let goals = [
      { id: 'goal-dieng', title: 'Trip Liburan ke Dieng 2026', target_amount: 1040000, current_amount: 300000, target_date: '2026-08-29', status: 'in_progress', icon: 'landscape' },
      { id: 'goal-beat', title: 'Sinking Fund Ganti Ban Beat', target_amount: 450000, current_amount: 150000, target_date: '2026-09-15', status: 'in_progress', icon: 'two_wheeler' },
      { id: 'goal-pajak', title: 'Sinking Fund Pajak STNK', target_amount: 250000, current_amount: 62500, target_date: '2026-11-20', status: 'in_progress', icon: 'receipt_long' }
    ];

    if (prefGoals?.value) {
      try { goals = JSON.parse(prefGoals.value); } catch (e) {}
    }

    // 3. Fetch Bills & Installments
    const { data: prefBills } = await supabase
      .from('user_preferences')
      .select('value')
      .eq('user_id', userId)
      .eq('key', 'DYNAMIC_BILLS')
      .single();

    let bills = [
      { id: 'bill-jago', name: 'Cicilan Bank Jago', amount: 67940, due_day: 20, remaining_tenor: 11, total_tenor: 12, type: 'installment', icon: 'credit_card' },
      { id: 'bill-rifky', name: 'Hutang ke Rifky', amount: 100000, due_day: 5, remaining_tenor: 1, total_tenor: 1, type: 'debt', icon: 'handshake' },
      { id: 'bill-kos', name: 'Sewa Kos Bulanan Malang', amount: 500000, due_day: 1, remaining_tenor: 12, total_tenor: 12, type: 'recurring', icon: 'home' }
    ];

    if (prefBills?.value) {
      try { bills = JSON.parse(prefBills.value); } catch (e) {}
    }

    // 4. Fetch Quick Action Pills
    const { data: prefPills } = await supabase
      .from('user_preferences')
      .select('value')
      .eq('user_id', userId)
      .eq('key', 'DYNAMIC_QUICK_PILLS')
      .single();

    let pills = [
      { id: 'p-split', label: '📱 Split Bill WA', query: 'buatkan split bill patungan makan ber-4 total 80000', icon: 'group', color: 'text-tosca' },
      { id: 'p-jago', label: '🧮 Pelunasan Jago', query: 'simulasi pelunasan awal bank jago', icon: 'calculate', color: 'text-amber' },
      { id: 'p-check', label: '📋 Checklist Dieng', query: 'tampilkan checklist interaktif persiapan liburan dieng', icon: 'checklist', color: 'text-lime' },
      { id: 'p-beat', label: '🛵 Servis Motor', query: 'cek status odometer dan servis motor', icon: 'two_wheeler', color: 'text-primary' },
      { id: 'p-line', label: 'Tren Arus Kas', query: 'buatkan line chart tren arus kas harian dan burn rate', icon: 'show_chart', color: 'text-tosca' },
      { id: 'p-donut', label: 'Alokasi Pos', query: 'buatkan donut chart alokasi pengeluaran per kategori', icon: 'pie_chart', color: 'text-amber' },
      { id: 'p-gantt', label: 'Gantt 2026', query: 'tampilkan visual gantt chart roadmap 2026', icon: 'calendar_month', color: 'text-emerald' },
      { id: 'p-map', label: 'Peta Dieng', query: 'tampilkan rute dan peta lokasi trip ke Dieng', icon: 'map', color: 'text-tosca' }
    ];

    if (prefPills?.value) {
      try { pills = JSON.parse(prefPills.value); } catch (e) {}
    }

    // 5. Fetch Multi-Motor Vehicles Fleet
    const { data: prefVehicles } = await supabase
      .from('user_preferences')
      .select('value')
      .eq('user_id', userId)
      .eq('key', 'DYNAMIC_VEHICLES')
      .single();

    let vehicles = [
      { id: 'v-beat', name: 'Honda Beat FI', plate: 'N 4567 XX', km_per_liter: 50.2, fuel_type: 'Pertalite', current_km: 32500, next_service_km: 35000, is_active: true, icon: 'two_wheeler' },
      { id: 'v-vario', name: 'Honda Vario 125', plate: 'N 1234 YY', km_per_liter: 44.5, fuel_type: 'Pertalite', current_km: 18200, next_service_km: 20000, is_active: false, icon: 'two_wheeler' }
    ];

    if (prefVehicles?.value) {
      try { vehicles = JSON.parse(prefVehicles.value); } catch (e) {}
    }

    // 6. Fetch Emergency ICE Profile
    const { data: prefIce } = await supabase
      .from('user_preferences')
      .select('value')
      .eq('user_id', userId)
      .eq('key', 'EMERGENCY_ICE_PROFILE')
      .single();

    let emergencyProfile = {
      fullName: 'Mas Firman (M. Firman Syah)',
      city: 'Kota Malang, Jawa Timur',
      bloodType: 'O (Positif)',
      emergencyContactName: 'Ibu / Keluarga',
      emergencyContactPhone: '0812-3456-7890',
      bpjsNumber: '0001234567890',
      medicalNotes: 'Tidak ada alergi obat berat. Sehat prima.'
    };

    if (prefIce?.value) {
      try { emergencyProfile = JSON.parse(prefIce.value); } catch (e) {}
    }

    // 7. Fetch Categories
    const categories = await getUserCategories(userId);

    return NextResponse.json({
      ok: true,
      wallets,
      goals,
      bills,
      pills,
      vehicles,
      emergencyProfile,
      categories
    });
  } catch (error: any) {
    console.error('Error fetching dynamic state:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, userId, payload } = await req.json();
    const uid = userId || 'fc2758d3-78bb-4e22-b9f0-b3b16568b671';

    if (action === 'save_wallets') {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: uid,
          key: 'DYNAMIC_WALLETS',
          value: JSON.stringify(payload.wallets),
          learned_from: 'user_dynamic_hub',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,key' });
      return NextResponse.json({ ok: true, message: 'Dompet berhasil disimpan!' });
    }

    if (action === 'save_goals') {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: uid,
          key: 'DYNAMIC_GOALS',
          value: JSON.stringify(payload.goals),
          learned_from: 'user_dynamic_hub',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,key' });
      return NextResponse.json({ ok: true, message: 'Target menabung berhasil disimpan!' });
    }

    if (action === 'save_bills') {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: uid,
          key: 'DYNAMIC_BILLS',
          value: JSON.stringify(payload.bills),
          learned_from: 'user_dynamic_hub',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,key' });
      return NextResponse.json({ ok: true, message: 'Daftar tagihan berhasil disimpan!' });
    }

    if (action === 'save_pills') {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: uid,
          key: 'DYNAMIC_QUICK_PILLS',
          value: JSON.stringify(payload.pills),
          learned_from: 'user_dynamic_hub',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,key' });
      return NextResponse.json({ ok: true, message: 'Tombol pintasan berhasil disimpan!' });
    }

    if (action === 'save_vehicles') {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: uid,
          key: 'DYNAMIC_VEHICLES',
          value: JSON.stringify(payload.vehicles),
          learned_from: 'user_dynamic_hub',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,key' });
      return NextResponse.json({ ok: true, message: 'Daftar motor berhasil disimpan!' });
    }

    if (action === 'save_emergency_profile') {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: uid,
          key: 'EMERGENCY_ICE_PROFILE',
          value: JSON.stringify(payload.emergencyProfile),
          learned_from: 'user_settings',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,key' });
      return NextResponse.json({ ok: true, message: 'Profil Darurat SOS berhasil diperbarui!' });
    }

    if (action === 'pay_bill') {
      const { billName, amount, wallet } = payload;
      await insertTransaction({
        user_id: uid,
        amount: Number(amount),
        type: 'expense',
        merchant: billName,
        description: `Pembayaran Tagihan / Cicilan: ${billName}`,
        payment_method: wallet || 'Cash Kertas',
        source: 'chat_manual',
        occurred_at: new Date().toISOString()
      });
      return NextResponse.json({ ok: true, message: `Tagihan ${billName} sebesar Rp ${Number(amount).toLocaleString('id-ID')} berhasil dibayar!` });
    }

    return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error executing dynamic action:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
