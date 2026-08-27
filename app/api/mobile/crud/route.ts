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

    // --- TRANSACTIONS CRUD ---
    if (action === 'create_transaction') {
      const { amount, type, merchant, payment_method, description, occurred_at } = payload;
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .insert({
          user_id: safeUserId,
          amount: Number(amount) || 0,
          type: type || 'expense',
          merchant: merchant || 'Mobile Input',
          payment_method: payment_method || 'Cash Kertas',
          description: description || '',
          occurred_at: occurred_at || new Date().toISOString(),
          source: 'mobile_app',
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      return NextResponse.json({ ok: true, data }, { headers: corsHeaders });
    }

    if (action === 'update_transaction') {
      const { id, amount, type, merchant, payment_method, description } = payload;
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .update({
          amount: Number(amount) || 0,
          type,
          merchant,
          payment_method,
          description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
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

    // --- ACTIVITIES CRUD ---
    if (action === 'create_activity') {
      const { title, description, status, priority, start_time, end_time } = payload;
      const { data, error } = await supabaseAdmin
        .from('activities')
        .insert({
          user_id: safeUserId,
          title,
          description: description || '',
          status: status || 'pending',
          priority: priority || 'medium',
          start_time: start_time || new Date().toISOString(),
          end_time: end_time || null,
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
      return NextResponse.json({ ok: true, data }, { headers: corsHeaders });
    }

    if (action === 'update_activity') {
      const { id, title, description, status, priority, start_time, end_time } = payload;
      const { data, error } = await supabaseAdmin
        .from('activities')
        .update({
          title,
          description,
          status,
          priority,
          start_time,
          end_time,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
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
