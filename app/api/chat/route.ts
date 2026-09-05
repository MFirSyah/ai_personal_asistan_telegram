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
import { evaluateProactiveCheckIns } from '@/lib/services/proactive-companion';

import { getModelQuotaStatus } from '@/lib/gemini/client';

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

export async function GET() {
  const quota = getModelQuotaStatus();
  return NextResponse.json({ ok: true, model_info: quota }, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userMessage, userName, action } = body;

    const safeUserId = userId || 'fc2758d3-78bb-4e22-b9f0-b3b16568b671';

    // Handle Model Quota Status Query
    if (action === 'get_model_quota') {
      const quota = getModelQuotaStatus();
      return NextResponse.json({ ok: true, model_info: quota }, { headers: corsHeaders });
    }

    // Handle Proactive Check-Ins Query
    if (action === 'get_proactive_checkins') {
      const [activities, plans] = await Promise.all([
        getRecentActivities(safeUserId, 20),
        getActivePlans(safeUserId),
      ]);
      const checkIns = evaluateProactiveCheckIns(activities, plans);
      return NextResponse.json({ ok: true, check_ins: checkIns }, { headers: corsHeaders });
    }

    if (!userMessage) {
      return NextResponse.json({ error: 'userMessage is required' }, { status: 400, headers: corsHeaders });
    }

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

    const isPlanOrTripQuery = /(dieng|tiket dieng|cicil tiket|nyicil tiket|sisa bayar tiket|kurang bayar tiket|sudah bayar tiket|pagu dieng)/i.test(userMessage);
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

    // 5. Sanitize and Save assistant messages (Clean any bullet * into •)
    const sanitizedMessages: string[] = (result.messages && result.messages.length > 0)
      ? result.messages.map((m: string) => {
          if (!m || typeof m !== 'string') return m;
          return m
            // Normalize any bullet points starting with * or - into •
            .replace(/(?:^|\n)\s*[\*]\s+/g, '\n• ')
            // Clean stray asterisks around words like *word* without bold
            .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '$1');
        })
      : ['Perintah berhasil diproses.'];

    for (const m of sanitizedMessages) {
      saveChatMessage(safeUserId, 'assistant', m).catch(console.error);
    }

    // Combine charts from AI orchestration and proactive keyword detector (max 5)
    const detectedCharts: string[] = [];
    const lowerMsg = userMessage.toLowerCase();
    if (/gantt|roadmap|peta waktu|timeline/i.test(lowerMsg)) detectedCharts.push('gantt');
    if (/line\s*chart|grafik garis|tren arus kas|tren kas/i.test(lowerMsg)) detectedCharts.push('line');
    if (/donut|doughnut|grafik donat|pie\s*chart|alokasi 50/i.test(lowerMsg)) detectedCharts.push('donut');
    if (/bar\s*chart|grafik batang|diagram batang|komposisi kas/i.test(lowerMsg)) detectedCharts.push('bar');
    if (/eisenhower|kuadran|prioritas agenda/i.test(lowerMsg)) detectedCharts.push('eisenhower');
    if (/semua chart|semua grafik|chart analisis|grafik lengkap|analisis lengkap/i.test(lowerMsg)) {
      detectedCharts.push('gantt', 'line', 'donut', 'bar', 'eisenhower');
    }

    const combinedCharts = Array.from(new Set([
      ...(result.charts || []),
      ...(result.chart ? [result.chart.type] : []),
      ...detectedCharts,
    ])).slice(0, 5);

    // Check if any proactive check-ins should be attached
    const checkIns = evaluateProactiveCheckIns(activities, plans);
    const modelInfo = getModelQuotaStatus(result.usedModel);

    // Build dynamic context-aware quick actions
    const quickActions: Array<{ label: string; icon: string; action: string; payload?: string }> = [];

    // Route-specific actions
    if (result.route && (result.route.origin || result.route.destination)) {
      quickActions.push({ label: 'Buka Rute Maps', icon: '🗺️', action: 'open_url', payload: result.route.google_maps_directions_url });
    }

    // Location-specific actions
    if (result.locations && result.locations.length > 0) {
      quickActions.push({ label: 'Lihat Semua di Maps', icon: '📍', action: 'open_url', payload: result.locations[0]?.google_maps_url || '' });
    }

    // Finance-specific actions
    if (/saldo|uang|dompet|kas|wallet|cek saldo/i.test(lowerMsg)) {
      quickActions.push({ label: 'Cek Saldo', icon: '💵', action: 'send_message', payload: 'Cek saldo semua dompet' });
      quickActions.push({ label: 'Laporan Hari Ini', icon: '📊', action: 'send_message', payload: 'Tampilkan laporan keuangan hari ini' });
    }

    if (/gantt|timeline|jadwal|agenda/i.test(lowerMsg)) {
      quickActions.push({ label: 'Gantt Chart', icon: '📅', action: 'send_message', payload: 'Tampilkan gantt chart timeline' });
    }

    if (/grafik|chart|analisis|tren/i.test(lowerMsg)) {
      quickActions.push({ label: 'Analisis Lengkap', icon: '📈', action: 'send_message', payload: 'Tampilkan semua chart analisis lengkap' });
    }

    // Navigation-specific actions
    if (/maps|rute|navigasi|jalan ke|arah ke|pergi ke/i.test(lowerMsg)) {
      quickActions.push({ label: 'Tips Berkendara', icon: '🛣️', action: 'send_message', payload: 'Berikan tips berkendara aman ke tujuan tersebut' });
      quickActions.push({ label: 'Estimasi BBM', icon: '⛽', action: 'send_message', payload: 'Hitung estimasi BBM dan biaya bensin perjalanan' });
    }

    // Exploration / recommendation actions
    if (/rekomendasi|wisata|kuliner|tempat|makan|nongkrong|kafe|cafe/i.test(lowerMsg)) {
      quickActions.push({ label: 'Cari Kuliner', icon: '🍜', action: 'send_message', payload: 'Rekomendasi sentra kuliner terdekat' });
      quickActions.push({ label: 'Wisata Populer', icon: '🏞️', action: 'send_message', payload: 'Rekomendasi wisata populer di sekitar' });
    }

    // Default fallback actions (always show at least some useful actions)
    if (quickActions.length === 0) {
      quickActions.push(
        { label: 'Cek Saldo', icon: '💵', action: 'send_message', payload: 'Cek saldo semua dompet' },
        { label: 'Agenda Hari Ini', icon: '📋', action: 'send_message', payload: 'Tampilkan agenda hari ini' },
        { label: 'Analisis Keuangan', icon: '📊', action: 'send_message', payload: 'Tampilkan analisis keuangan lengkap' },
      );
    }

    return NextResponse.json({
      ok: true,
      messages: sanitizedMessages,
      extracted_data: result.extracted_data || null,
      follow_up_question: result.follow_up_question || '',
      check_ins: checkIns,
      charts: combinedCharts,
      model_info: modelInfo,
      // Structured data for rich UI rendering
      route: result.route || null,
      locations: result.locations || null,
      location: result.location || null,
      // Dynamic context-aware quick action buttons
      quick_actions: quickActions.slice(0, 5),
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500, headers: corsHeaders });
  }
}
