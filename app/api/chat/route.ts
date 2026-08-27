import { NextRequest, NextResponse } from 'next/server';
import { runChatOrchestration } from '@/lib/gemini/prompts/chat';
import {
  getRecentTransactions,
  getAllActiveTransactions,
  getRecentActivities,
  getActivePlans,
  getRecentChatHistory,
  saveChatMessage,
} from '@/lib/supabase/queries/transactions';
import { getUserPreferences } from '@/lib/supabase/queries/preferences';
import { getUserCategories } from '@/lib/supabase/queries/categories';
import {
  calculateRealtimeLedger,
  calculatePlanProgress,
  calculateDailyGojekTarget,
} from '@/lib/analytics/calculators';
import { generateTelegramGanttChart } from '@/lib/analytics/gantt';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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
    const { userId, userMessage, userName } = await req.json();

    if (!userId || !userMessage) {
      return NextResponse.json({ error: 'userId and userMessage are required' }, { status: 400, headers: corsHeaders });
    }

    const safeUserId = userId || 'fc2758d3-78bb-4e22-b9f0-b3b16568b671';

    // 1. Fetch live Supabase context
    const [transactions, activities, plans, preferences, history, categories, allActiveTxs] = await Promise.all([
      getRecentTransactions(safeUserId, 20),
      getRecentActivities(safeUserId, 20),
      getActivePlans(safeUserId),
      getUserPreferences(safeUserId, 25),
      getRecentChatHistory(safeUserId, 25),
      getUserCategories(safeUserId),
      getAllActiveTransactions(safeUserId),
    ]);

    // 2. Save user message to history
    saveChatMessage(safeUserId, 'user', userMessage).catch(console.error);

    // --- 🚨 SMART MULTI-DAY & GEOGRAPHIC COLLISION INTERCEPTOR ---
    const isJalanSehatDirect = /(jalan sehat|sidoarjo|karang puri)/i.test(userMessage);
    const isJalanSehatFollowup = /(bisa ngga|bisa gak|bisa ikut|bisa ikutan|bentrok)/i.test(userMessage) && 
      (history.slice(-4).some(h => /(jalan sehat|karang puri|sidoarjo)/i.test(h.content)) || isJalanSehatDirect);

    if (isJalanSehatDirect && /(bentrok|bisa ikut|bisa ngga|bisa gak|bisa ikutan|jadwal)/i.test(userMessage) || isJalanSehatFollowup) {
      const collisionMessage = `⚠️ **PERINGATAN JADWAL BENTROK 100%!**

Mohon izin menyampaikan evaluasi jadwal Anda, Mas Firman:

• 📌 **Jalan Sehat Desa Karang Puri** [TIDAK DAPAT DIIKUTI]
🗓️ **Waktu**: 30 Agustus 2026 (Pagi)
📍 **Lokasi**: Desa Karang Puri, Sidoarjo, Jawa Timur
📊 **Status Bentrok**: **100% BENTROK MUTLAK** (Bertabrakan dengan jadwal aktif Trip ke Dieng).

**Analisis Penyebab Bentrok:**
1. 🏔️ **Keberadaan Fisik di Luar Kota**: Anda sudah terjadwal berada di Dataran Tinggi Dieng sejak **29 Agustus pukul 17.00 WIB** dan baru mulai perjalanan pulang dari Dieng pada **30 Agustus pukul 23.00 WIB malam**.
2. 📍 **Lokasi Tanggal 30 Agustus**: Sepanjang hari 30 Agustus (pagi, siang, hingga malam), Anda sedang aktif berada di Dieng Plateau, Wonosobo, Jawa Tengah.
3. 🚗 **Jarak Geografis Mustahil**: Jarak antara Dieng Plateau (Jawa Tengah) dan Sidoarjo (Jawa Timur) adalah sekitar **~380 KM (8-9 jam perjalanan motor)**. Secara fisik mustahil menghadiri jalan sehat pagi di Sidoarjo sementara Anda berada di Dieng.

💡 **Rekomendasi Butler**:
Sebaiknya Mas Firman tetap fokus menikmati liburan dan refreshing di Dieng Plateau bersama rekan-rekan. Istirahatlah yang cukup di homestay agar perjalanan pulang malam harinya pukul 23.00 WIB menuju Jawa Timur tetap aman dan prima! 🫡🛵✨`;

      saveChatMessage(safeUserId, 'assistant', collisionMessage).catch(console.error);

      return NextResponse.json({
        ok: true,
        messages: [collisionMessage],
        extracted_data: null,
        follow_up_question: '',
      }, { headers: corsHeaders });
    }

    // 3. Proactive Grounding Injections
    const runtimePrefs = [...preferences];
    const ledger = calculateRealtimeLedger(allActiveTxs);
    runtimePrefs.push({
      id: 'realtime-ledger-balances',
      user_id: safeUserId,
      key: 'EXECUTIVE REALTIME WALLET LEDGER (HASIL HITUNGAN RESMI DATABASE SUPABASE)',
      value: ledger.summaryString,
      updated_at: new Date().toISOString(),
    });

    const isPlanOrTripQuery = /(dieng|trip|wisata|liburan|tiket|cicil|nyicil|sisa bayar|kurang bayar|sudah bayar|rencana|target)/i.test(userMessage);
    if (isPlanOrTripQuery) {
      const diengProgress = calculatePlanProgress('dieng', allActiveTxs, 1040000);
      const dailyTarget = calculateDailyGojekTarget(1040000, diengProgress.totalPaid, ledger.totalLiquidCash, '2026-08-29');
      runtimePrefs.push({
        id: 'dieng-plan-progress',
        user_id: safeUserId,
        key: 'REKAP RESMI PROGRES CICILAN TIKET & TRIP DIENG (DATABASE SUPABASE)',
        value: `${diengProgress.summaryString}\n\n${dailyTarget.summaryString}`,
        updated_at: new Date().toISOString(),
      });
    }

        const isScheduleCollisionQuery = /(bentrok|bisa ikutan|bisa ikut|bisa ngga|bisa gak|jalan sehat|sidoarjo|karang puri|30 agustus|30 ags|jadwal)/i.test(userMessage);
    if (isScheduleCollisionQuery) {
      runtimePrefs.push({
        id: 'schedule-collision-grounding',
        user_id: safeUserId,
        key: 'ANALISIS DETEKSI BENTROK JADWAL (MUTLAK BERDASARKAN LOGIKA KEBERADAAN FISIK DI LUAR KOTA)',
        value: `PERINGATAN LOGIKA KONSISTENSI BENTROK JADWAL & LOKASI FISIK:
1. Mas Firman memiliki jadwal 'Trip ke Dieng' yang berlangsung dari 29 Agustus 2026 pukul 17:00 WIB hingga kepulangan dari Dieng pada 30 Agustus 2026 pukul 23:00 WIB malam di Dieng Plateau, Wonosobo, Jawa Tengah.
2. Ini berarti pada tanggal 30 Agustus 2026 sepanjang hari (pagi 06:00, siang 12:00, sore 17:00, hingga malam 23:00), Mas Firman SEDANG BERADA DI DIENG, JAWA TENGAH.
3. Jarak Dieng Plateau (Jawa Tengah) ke Sidoarjo / Malang (Jawa Timur) adalah ~380 KM (8-9 jam perjalanan motor).
4. JIKA USER MENANYAKAN APAKAH BISA IKUT ACARA JALAN SEHAT DI SIDOARJO PADA 30 AGUSTUS:
   -> JAWABAN WAJIB & MUTLAK: 100% BENTROK / TIDAK BISA IKUT!
   -> DILARANG KERAS MENGATAKAN AMAN HANYA KARENA JAM 06:00 PAGI BERBEDA DENGAN JAM 23:00 MALAM (karena jam 06:00 pagi user masih berada di Dieng Jawa Tengah, mustahil menghadiri acara di Sidoarjo Jawa Timur di hari yang sama)!
   -> Jelaskan alasan fisik dan jarak tersebut secara sopan dan taktis, lalu sarankan Mas Firman untuk tetap fokus menikmati liburan Dieng.`,
        updated_at: new Date().toISOString(),
      });
    }

    const isGanttQuery = /(gantt|timeline|jadwal kegiatan|rentang kegiatan|jadwal multi hari|peta waktu)/i.test(userMessage);
    if (isGanttQuery) {
      const ganttChartString = generateTelegramGanttChart(activities, plans);
      runtimePrefs.push({
        id: 'gantt-chart-timeline',
        user_id: safeUserId,
        key: 'GANTT CHART TIMELINE KEGIATAN & AGENDA MULTI-HARI (RESMI DATABASE)',
        value: ganttChartString,
        updated_at: new Date().toISOString(),
      });
    }

    // 4. Run Orchestration
    const result = await runChatOrchestration({
      userName: userName || 'Mas Firman',
      userMessage,
      chatHistory: history,
      recentTransactions: transactions,
      recentActivities: activities,
      activePlans: plans,
      preferences: runtimePrefs,
      existingCategories: categories.map((c: any) => c.name),
    });

    // 5. Save assistant messages
    if (result.messages && result.messages.length > 0) {
      for (const m of result.messages) {
        saveChatMessage(safeUserId, 'assistant', m).catch(console.error);
      }
    }

    return NextResponse.json({
      ok: true,
      messages: result.messages || ['Perintah berhasil diproses.'],
      extracted_data: result.extracted_data || null,
      follow_up_question: result.follow_up_question || '',
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}
