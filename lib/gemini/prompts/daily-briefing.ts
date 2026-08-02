import { generateContentWithFallback } from '../client';

export interface DailyBriefingContext {
  userName?: string;
  insightPayload?: any[];
  yesterdayTransactions?: any[];
  todayPlans?: any[];
}

export interface DailyBriefingResult {
  messages: string[];
  follow_up_question: string;
}

export async function generateDailyBriefing(
  context: DailyBriefingContext
): Promise<DailyBriefingResult> {
  const prompt = `
Kamu adalah Asisten Keuangan & Aktivitas Personal yang menyapa user di pagi hari dengan santai, energik, dan memberikan briefing ringkas.

DATA CONTEXT:
Nama User: ${context.userName || 'Teman'}
Wawasan Harian Terakhir (Insight): ${JSON.stringify(context.insightPayload || [])}
Transaksi Kemarin: ${JSON.stringify(context.yesterdayTransactions || [])}
Rencana Hari Ini: ${JSON.stringify(context.todayPlans || [])}

TUGAS:
1. Buat 1-3 bubble pesan ringkas (\`messages\`) menyapa di pagi hari, merangkum pencapaian/pengeluaran kemarin, dan memberi penyemangat untuk hari ini.
2. Buat 1 pertanyaan penutup (\`follow_up_question\`) untuk memancing komunikasi pagi.

FORMAT JSON OUTPUT:
{
  "messages": [
    "Selamat pagi! ☀️ Kemarin kamu mencatat total pengeluaran sebesar Rp 150.000.",
    "Untuk hari ini, ada 2 agenda terencana: ..."
  ],
  "follow_up_question": "Ada rencana transaksi atau kegiatan lain yang ingin kamu catat pagi ini?"
}
`;

  try {
    const { response } = await generateContentWithFallback(prompt, {
      responseMimeType: 'application/json',
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      messages: Array.isArray(parsed.messages)
        ? parsed.messages
        : ['Selamat pagi! Semoga harimu menyenangkan dan produktif hari ini. ☀️'],
      follow_up_question:
        parsed.follow_up_question || 'Ada transaksi atau aktivitas yang mau kamu catat pagi ini?',
    };
  } catch (error) {
    console.error('Daily briefing prompt error:', error);
    return {
      messages: ['Selamat pagi! Semoga hari ini berjalan lancar. ☀️'],
      follow_up_question: 'Ada yang bisa aku bantu catat hari ini?',
    };
  }
}
