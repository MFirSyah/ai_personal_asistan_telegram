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
        value: `INSTRUKSI EVALUASI JADWAL & AGENDA DATA-DRIVEN:
1. Hari ini adalah September 2026. Periksa tanggal setiap agenda yang tersimpan di database recentActivities.
2. Jika suatu agenda (seperti Trip ke Dieng 29-30 Agustus 2026 atau Narik Gojek Rutin Agustus) bertanggal sebelum hari ini atau user mengonfirmasi sudah selesai, catat dan perlakukan agenda tersebut sebagai SELESAI / HISTORIS, bukan agenda aktif masa depan!
3. Jawab pertanyaan pengguna mengenai agenda hari ini secara akurat berdasarkan daftar kegiatan aktif yang tersimpan di recentActivities.`,
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
