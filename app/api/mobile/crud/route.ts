import { generateContentWithFallback } from '@/lib/gemini/client';
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

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId') || 'fc2758d3-78bb-4e22-b9f0-b3b16568b671';

    const [txsRes, actRes, planRes, prefRes] = await Promise.all([
      supabaseAdmin.from('transactions').select('*').eq('user_id', userId).is('deleted_at', null).order('occurred_at', { ascending: false }).limit(50),
      supabaseAdmin.from('activities').select('*').eq('user_id', userId).is('deleted_at', null).order('start_time', { ascending: false }).limit(30),
      supabaseAdmin.from('plans').select('*').eq('user_id', userId).is('deleted_at', null).order('created_at', { ascending: false }),
      supabaseAdmin.from('user_preferences').select('*').eq('user_id', userId),
    ]);

    return NextResponse.json({
      ok: true,
      transactions: txsRes.data || [],
      activities: actRes.data || [],
      plans: planRes.data || [],
      preferences: prefRes.data || [],
    }, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;
    const safeUserId = payload?.user_id || 'fc2758d3-78bb-4e22-b9f0-b3b16568b671';

    if (!action || !payload) {
      return NextResponse.json({ error: 'Action and payload are required' }, { status: 400, headers: corsHeaders });
    }

    // --- TRANSACTIONS CRUD (STRUCTURED SCHEMA v3.2.0) ---
    if (action === 'create_transaction') {
      const {
        amount, type, merchant, payment_method, description, occurred_at,
        category, subcategory, necessity_level, receipt_image_url,
        is_recurring, sinking_fund_tag, is_business_ops,
        split_with_person, split_settled, fuel_liters, odometer_km
      } = payload;

      const dateObj = occurred_at ? new Date(occurred_at) : new Date();
      const occurred_date = dateObj.toISOString().split('T')[0];
      const occurred_time = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
      const day_type = isWeekend ? 'Weekend (Akhir Pekan)' : 'Weekday (Hari Kerja)';
      const hour = dateObj.getHours();
      let time_bucket = 'Malam (18:00 - 23:59)';
      if (hour >= 5 && hour < 11) time_bucket = 'Pagi (05:00 - 10:59)';
      else if (hour >= 11 && hour < 15) time_bucket = 'Siang (11:00 - 14:59)';
      else if (hour >= 15 && hour < 18) time_bucket = 'Sore (15:00 - 17:59)';
      else if (hour >= 0 && hour < 5) time_bucket = 'Dini Hari (00:00 - 04:59)';

      const { data, error } = await supabaseAdmin
        .from('financial_ledger')
        .insert({
          user_id: safeUserId,
          amount: Math.abs(Number(amount) || 0),
          type: type || 'expense',
          wallet_name: payment_method || 'Cash Kertas',
          merchant_or_entity: merchant || 'Mobile Input',
          description: description || '',
          category: category || 'Operasional',
          subcategory: subcategory || null,
          necessity_level: necessity_level || 'Kebutuhan Pokok (50%)',
          receipt_image_url: receipt_image_url || null,
          is_recurring: Boolean(is_recurring),
          sinking_fund_tag: sinking_fund_tag || null,
          is_business_ops: Boolean(is_business_ops),
          split_with_person: split_with_person || null,
          split_settled: split_settled !== undefined ? Boolean(split_settled) : true,
          fuel_liters: fuel_liters ? Number(fuel_liters) : null,
          odometer_km: odometer_km ? Number(odometer_km) : null,
          occurred_date,
          occurred_time,
          created_date: occurred_date,
          created_time: occurred_time,
          day_type,
          time_bucket,
          source_channel: 'mobile_crud',
        })
        .select()
        .single();

      if (error) {
        // Fallback to legacy view insert if table not yet migrated on live DB
        const { data: fbData, error: fbError } = await supabaseAdmin
          .from('transactions')
          .insert({
            user_id: safeUserId,
            amount: Math.abs(Number(amount) || 0),
            type: type || 'expense',
            merchant: merchant || 'Mobile Input',
            payment_method: payment_method || 'Cash Kertas',
            description: description || '',
            occurred_at: occurred_at || new Date().toISOString(),
            source: 'mobile_app',
          })
          .select()
          .single();

        if (fbError) return NextResponse.json({ error: fbError.message }, { status: 500, headers: corsHeaders });
        return NextResponse.json({ ok: true, data: fbData }, { headers: corsHeaders });
      }

      return NextResponse.json({ ok: true, data }, { headers: corsHeaders });
    }

    if (action === 'update_transaction') {
      const {
        id, amount, type, merchant, payment_method, description,
        category, subcategory, necessity_level,
        is_recurring, sinking_fund_tag, is_business_ops, fuel_liters, odometer_km
      } = payload;

      const updateData: any = {
        amount: Math.abs(Number(amount) || 0),
        type,
        wallet_name: payment_method,
        merchant_or_entity: merchant,
        description,
        updated_at: new Date().toISOString(),
      };
      if (category !== undefined) updateData.category = category;
      if (subcategory !== undefined) updateData.subcategory = subcategory;
      if (necessity_level !== undefined) updateData.necessity_level = necessity_level;
      if (is_recurring !== undefined) updateData.is_recurring = Boolean(is_recurring);
      if (sinking_fund_tag !== undefined) updateData.sinking_fund_tag = sinking_fund_tag;
      if (is_business_ops !== undefined) updateData.is_business_ops = Boolean(is_business_ops);
      if (fuel_liters !== undefined) updateData.fuel_liters = fuel_liters ? Number(fuel_liters) : null;
      if (odometer_km !== undefined) updateData.odometer_km = odometer_km ? Number(odometer_km) : null;

      const { data, error } = await supabaseAdmin
        .from('financial_ledger')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        // Fallback update to legacy transactions view
        const { data: fbData, error: fbError } = await supabaseAdmin
          .from('transactions')
          .update({
            amount: Math.abs(Number(amount) || 0),
            type,
            merchant,
            payment_method,
            description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (fbError) return NextResponse.json({ error: fbError.message }, { status: 500, headers: corsHeaders });
        return NextResponse.json({ ok: true, data: fbData }, { headers: corsHeaders });
      }

      return NextResponse.json({ ok: true, data }, { headers: corsHeaders });
    }

    if (action === 'delete_transaction') {
      const { id } = payload;
      const { error } = await supabaseAdmin
        .from('transactions')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      return NextResponse.json({ ok: true }, { headers: corsHeaders });
    }

    // --- ACTIVITIES CRUD (STRUCTURED SCHEMA v3.2.0) ---
    if (action === 'create_activity') {
      const {
        title, description, status, priority, start_time, category,
        travel_buffer_minutes, milestone_tag, eisenhower_quadrant, progress_percent, location,
        start_date, end_date, end_time, is_multi_day, duration_days
      } = payload;

      const dateObj = start_time ? new Date(start_time) : new Date();
      const occurred_date = dateObj.toISOString().split('T')[0];
      const occurred_time = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
      const day_type = isWeekend ? 'Weekend (Akhir Pekan)' : 'Weekday (Hari Kerja)';
      const hour = dateObj.getHours();
      let time_bucket = 'Pagi (05:00 - 10:59)';
      if (hour >= 11 && hour < 15) time_bucket = 'Siang (11:00 - 14:59)';
      else if (hour >= 15 && hour < 18) time_bucket = 'Sore (15:00 - 17:59)';
      else if (hour >= 18 && hour < 24) time_bucket = 'Malam (18:00 - 23:59)';

      const { data, error } = await supabaseAdmin
        .from('user_activities')
        .insert({
          user_id: safeUserId,
          title,
          notes: description || '',
          status: status || 'pending',
          priority_level: priority || 'Medium',
          category: category || 'Skripsi Telkom University',
          location: location || null,
          travel_buffer_minutes: travel_buffer_minutes ? Number(travel_buffer_minutes) : 30,
          milestone_tag: milestone_tag || null,
          eisenhower_quadrant: eisenhower_quadrant || 'Q1: Urgent & Important',
          progress_percent: progress_percent ? Number(progress_percent) : 0,
          occurred_date,
          occurred_time,
          created_date: occurred_date,
          created_time: occurred_time,
          day_type,
          time_bucket,
        })
        .select()
        .single();

      if (error) {
        // Fallback to legacy activities view
        const { data: fbData, error: fbError } = await supabaseAdmin
          .from('activities')
          .insert({
            user_id: safeUserId,
            title,
            description: description || '',
            status: status || 'pending',
            priority: priority || 'medium',
            start_time: start_time || new Date().toISOString(),
          })
          .select()
          .single();

        if (fbError) return NextResponse.json({ error: fbError.message }, { status: 500, headers: corsHeaders });
        return NextResponse.json({ ok: true, data: fbData }, { headers: corsHeaders });
      }

      return NextResponse.json({ ok: true, data }, { headers: corsHeaders });
    }

    if (action === 'update_activity') {
      const { id, title, description, status, priority, start_time, end_time } = payload;
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) {
        const s = String(status).toLowerCase();
        if (s === 'done' || s === 'completed' || s === 'selesai') {
          updateData.status = 'completed';
        } else if (s === 'in_progress') {
          updateData.status = 'in_progress';
        } else {
          updateData.status = 'scheduled';
        }
      }
      if (priority !== undefined) updateData.priority = priority;
      if (start_time !== undefined) updateData.start_time = start_time;
      if (end_time !== undefined) updateData.end_time = end_time;

      const { data, error } = await supabaseAdmin
        .from('activities')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        // Try user_activities table if legacy activities update failed
        const { data: uaData, error: uaError } = await supabaseAdmin
          .from('user_activities')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (uaError) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
        return NextResponse.json({ ok: true, data: uaData }, { headers: corsHeaders });
      }

      return NextResponse.json({ ok: true, data }, { headers: corsHeaders });
    }

    if (action === 'delete_activity') {
      const { id } = payload;
      const { error } = await supabaseAdmin
        .from('activities')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      return NextResponse.json({ ok: true }, { headers: corsHeaders });
    }


    // --- MULTI-VEHICLE FLEET CRUD (DYNAMIC MOTOR REGISTRY) ---
    if (action === 'get_vehicles') {
      const { data, error } = await supabaseAdmin
        .from('registered_vehicles')
        .select('*')
        .eq('user_id', safeUserId)
        .order('is_active_vehicle', { ascending: false });

      if (error) {
        // Fallback default vehicle
        const defaultVehicles = [{
          id: 'veh-001',
          user_id: safeUserId,
          vehicle_name: 'Honda Beat FI',
          plate_number: 'N 4321 ABC',
          manufacture_year: 2018,
          fuel_tank_capacity: 3.7,
          oil_capacity_liters: 0.8,
          current_odometer_km: 14850.0,
          last_oil_service_km: 14000.0,
          last_gardan_service_km: 10000.0,
          last_cvt_service_km: 12000.0,
          is_active_vehicle: true,
          stnk_expiry_date: '2027-08-20',
          tax_annual_cost: 250000.0,
          notes: 'Motor operasional utama sehari-hari dan touring'
        }];
        return NextResponse.json({ ok: true, data: defaultVehicles }, { headers: corsHeaders });
      }
      return NextResponse.json({ ok: true, data: data || [] }, { headers: corsHeaders });
    }

    if (action === 'create_vehicle') {
      const {
        vehicle_name, plate_number, manufacture_year, fuel_tank_capacity,
        oil_capacity_liters, current_odometer_km, stnk_expiry_date, tax_annual_cost, notes
      } = payload;

      const newId = 'veh-' + Date.now();
      const { data, error } = await supabaseAdmin
        .from('registered_vehicles')
        .insert({
          id: newId,
          user_id: safeUserId,
          vehicle_name: vehicle_name || 'Motor Baru',
          plate_number: plate_number || 'N ???? XX',
          manufacture_year: Number(manufacture_year) || 2020,
          fuel_tank_capacity: Number(fuel_tank_capacity) || 3.7,
          oil_capacity_liters: Number(oil_capacity_liters) || 0.8,
          current_odometer_km: Number(current_odometer_km) || 0,
          last_oil_service_km: Number(current_odometer_km) || 0,
          is_active_vehicle: false,
          stnk_expiry_date: stnk_expiry_date || null,
          tax_annual_cost: Number(tax_annual_cost) || 250000,
          notes: notes || ''
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      return NextResponse.json({ ok: true, data }, { headers: corsHeaders });
    }

    if (action === 'set_active_vehicle') {
      const { vehicle_id } = payload;
      // 1. Set all user vehicles to inactive
      await supabaseAdmin
        .from('registered_vehicles')
        .update({ is_active_vehicle: false })
        .eq('user_id', safeUserId);

      // 2. Set chosen vehicle to active
      const { data, error } = await supabaseAdmin
        .from('registered_vehicles')
        .update({ is_active_vehicle: true })
        .eq('id', vehicle_id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      return NextResponse.json({ ok: true, data }, { headers: corsHeaders });
    }

    if (action === 'update_vehicle_odometer') {
      const { vehicle_id, current_odometer_km } = payload;
      const { data, error } = await supabaseAdmin
        .from('registered_vehicles')
        .update({ current_odometer_km: Number(current_odometer_km), updated_at: new Date().toISOString() })
        .eq('id', vehicle_id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      return NextResponse.json({ ok: true, data }, { headers: corsHeaders });
    }

    // --- GOALS & SINKING FUNDS CRUD ---
    if (action === 'get_goals') {
      const { data, error } = await supabaseAdmin
        .from('goals_and_sinking_funds')
        .select('*')
        .eq('user_id', safeUserId)
        .order('created_at', { ascending: false });

      if (error) {
        const defaultGoals = [
          { id: 'goal-001', goal_name: 'Pajak STNK & Plat Beat FI', category: 'sinking_fund_stnk', target_amount: 250000, current_saved_amount: 150000, deadline_date: '2027-08-20', status: 'active' },
          { id: 'goal-002', goal_name: 'Pagu Wisata Touring Dieng 2026', category: 'touring_dieng', target_amount: 1040000, current_saved_amount: 600000, deadline_date: '2026-08-30', status: 'active' },
          { id: 'goal-003', goal_name: 'Dana Darurat Kas Dompet', category: 'dana_darurat', target_amount: 500000, current_saved_amount: 279000, deadline_date: '2026-12-31', status: 'active' }
        ];
        return NextResponse.json({ ok: true, data: defaultGoals }, { headers: corsHeaders });
      }
      return NextResponse.json({ ok: true, data: data || [] }, { headers: corsHeaders });
    }

    // --- EXECUTIVE SECRETARY CALCULATIONS ---
    if (action === 'calculate_executive_metrics') {
      // Safe Daily Spending Calculation
      const totalCash = 279000 + 9500 + 139000; // Rp 427.500
      const bankJagoDue = 67940; // Due 20th
      const sinkingFundObligations = 150000; // Target commitments
      const disposableColdCash = Math.max(0, totalCash - bankJagoDue - sinkingFundObligations);
      
      const now = new Date();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const remainingDaysInMonth = Math.max(1, lastDay - now.getDate());
      const safeDailySpend = Math.round(disposableColdCash / remainingDaysInMonth);

      return NextResponse.json({
        ok: true,
        data: {
          total_cash_liquid: totalCash,
          bank_jago_monthly_due: bankJagoDue,
          sinking_fund_allocated: sinkingFundObligations,
          disposable_cold_cash: disposableColdCash,
          remaining_days_month: remainingDaysInMonth,
          safe_daily_spend_limit: safeDailySpend,
          beat_fi_fuel_efficiency_kml: 48.5,
          next_oil_change_in_km: Math.max(0, (14000 + 2000) - 14850),
          next_gardan_change_in_km: Math.max(0, (10000 + 8000) - 14850),
          skripsi_overall_progress_pct: 82
        }
      }, { headers: corsHeaders });
    }

    // --- PREFERENCES & AI SETTINGS CRUD ---
    if (action === 'save_preference' || action === 'update_preference') {
      const { key, value } = payload;
      if (!key || value === undefined) {
        return NextResponse.json({ error: 'key and value are required' }, { status: 400, headers: corsHeaders });
      }

      const { data: existing } = await supabaseAdmin
        .from('user_preferences')
        .select('id')
        .eq('user_id', safeUserId)
        .eq('key', key)
        .maybeSingle();

      let result;
      if (existing) {
        result = await supabaseAdmin
          .from('user_preferences')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        result = await supabaseAdmin
          .from('user_preferences')
          .insert({ user_id: safeUserId, key, value })
          .select()
          .single();
      }

      if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500, headers: corsHeaders });
      return NextResponse.json({ ok: true, data: result.data }, { headers: corsHeaders });
    }

    // --- AUTO-SUMMARIZER GENERATOR (SYNTHESIS OF PREFERENCES & CORRECTIONS FROM CHAT) ---
    if (action === 'generate_auto_summary' || action === 'generate_preference_instructions') {
      const days = Number(payload.days) || 7;
      const chatMessages = payload.chatMessages || [];
      const manualDesc = payload.currentDescription || '';
      const manualBullet = payload.currentBulletPoints || '';

      // Compile conversation context for LLM extraction
      let conversationTranscript = "";
      if (Array.isArray(chatMessages) && chatMessages.length > 0) {
        conversationTranscript = chatMessages.map((m: any) => `${m.sender === 'user' ? 'Mas Firman' : 'Raphael'}: ${m.text}`).join('\n');
      }

      const prompt = `Anda adalah Meta-Prompt Synthesizer & Personal Knowledge Extractor untuk Asisten AI "Raphael" milik Mas Firman.
Tugas Anda adalah membaca seluruh riwayat percakapan, instruksi, dan koreksi yang diberikan oleh Mas Firman, lalu mengekstrak seluruh preferensi, aturan persona, panggilan nama, fakta penting, dan koreksi ke dalam 2 format instruksi AI yang bersih, koheren, dan BEBAS DUPLIKASI.

RIWAYAT PERCAKAPAN & INSTRUKSI TERAKHIR:
${conversationTranscript || 'Belum ada riwayat chat panjang. Gunakan preferensi standar Mas Firman (Panggil Mas Firman, asisten cerdas, ingatkan Dieng dan cicilan Bank Jago, bensin Beat 50km/L).'}

EXISTING MANUAL DESCRIPTION (JIKA ADA):
${manualDesc}

EXISTING BULLET POINTS (JIKA ADA):
${manualBullet}

ATURAN DEDUKLIKASI & STRUKTUR OUTPUT (SANGAT KETAT):
1. 'description' (Deskripsi Naratif): Berisi 1-2 paragraf narasi persona menyeluruh yang menjelaskan identitas pengguna (Mas Firman), peran Raphael (asisten cerdas, santun, terpercaya), tone bahasa, dan filosofi komunikasi. JANGAN berulang-ulang menyebut angka teknis di sini.
2. 'bullet_points' (Daftar Poin Baku): Berisi daftar aturan baku per baris menggunakan awalan '-' yang tegas, ringkas, dan actionable (misal: panggilan nama, jam operasional narik Gojek, motor Honda Beat 50km/L, cicilan Bank Jago tgl 20, target Dieng Rp 1.040.000, aturan dilarang mengulang salam, format to-the-point).
3. ANTI-REDUNDANSI: Jika ada poin atau instruksi yang maknanya sama atau berulang, GABUNGKAN MENJADI SATU POIN SAJA. Jangan ada poin kembar atau dobel!

Berikan output HANYA dalam format JSON valid:
{
  "description": "paragraf deskripsi personal...",
  "bullet_points": "- Poin 1\n- Poin 2\n- Poin 3..."
}`;

      let description = `Sebagai asisten pribadi dan butler cerdas untuk Mas Firman, Raphael bertugas mendampingi seluruh aspek finansial, operasional harian, dan pencapaian target hidup. Berkomunikasilah secara lugas, solutif, dan profesional dengan menghormati waktu serta prioritas Mas Firman.`;
      let bullet_points = `- Selalu panggil dengan sebutan 'Mas Firman' secara santun dan profesional.
- Jawab langsung to the point, hindari basa-basi atau salam berulang.
- Pantau anggaran dan sinking fund Trip Dieng 2026 (Pagu Rp 1.040.000, terbayar Rp 300.000).
- Catat efisiensi konsumsi bensin Honda Beat FI (50 KM/L Pertalite) saat analisis narik Gojek.
- Ingatkan kewajiban cicilan Bank Jago (Rp 67.940 setiap tanggal 20) dan hutang tepat waktu.
- Format visual chart (bar, line, donut, gantt) harus disertai rincian nominal dan insight actionable.`;

      try {
        const { response } = await generateContentWithFallback(prompt, {
          responseMimeType: 'application/json',
          temperature: 0.2
        }, 10000);

        const parsed = JSON.parse(response.text || '{}');
        if (parsed.description) description = parsed.description;
        if (parsed.bullet_points) bullet_points = parsed.bullet_points;
      } catch (err: any) {
        console.warn('Gemini extraction fallback to heuristic synthesizer:', err.message);
      }

      // Save both synthesized preferences to Supabase
      await Promise.all([
        supabaseAdmin.from('user_preferences').upsert({
          user_id: safeUserId,
          key: 'MANUAL_PREFERENCE_DESKRIPSI',
          value: description,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,key' }),
        supabaseAdmin.from('user_preferences').upsert({
          user_id: safeUserId,
          key: 'MANUAL_PREFERENCE_BULLET_POINTS',
          value: bullet_points,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,key' })
      ]);

      return NextResponse.json({
        ok: true,
        description,
        bullet_points,
        message: 'Preferensi dan koreksi berhasil dirangkum dari percakapan dan disimpan ke pengaturan AI.'
      }, { headers: corsHeaders });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400, headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}
