import { ai, PRIMARY_MODEL } from '../client';

export interface ChatOrchestrationContext {
  userMessage: string;
  recentTransactions: any[];
  recentActivities: any[];
  activePlans: any[];
  preferences: any[];
  chatHistory: any[];
  userName?: string;
  existingCategories?: string[];
}

export interface ChatOrchestrationResult {
  messages: string[];
  follow_up_question?: string;
  extracted_data?: {
    transaction?: {
      amount: number;
      type: 'expense' | 'income';
      category: string;
      merchant?: string;
      description?: string;
      occurred_at?: string;
    } | null;
    activity?: {
      title: string;
      category?: string;
      description?: string;
      occurred_at?: string;
    } | null;
    preference?: {
      key: string;
      value: string;
      learned_from?: string;
    } | null;
  } | null;
  reasoning?: string;
  chart?: {
    type: 'bar' | 'line' | 'pie';
    title?: string;
    labels: string[];
    datasets: { label: string; data: number[] }[];
  } | null;
  location?: {
    name: string;
    lat: number;
    lng: number;
  } | null;
  sources?: { title: string; url: string }[];
}

// Helper to safely clean and parse JSON returned from LLM
function cleanAndParseJSON(rawText: string): any {
  if (!rawText) return {};

  let cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const startIdx = cleaned.indexOf('{');
  const endIdx = cleaned.lastIndexOf('}');

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    try {
      const sanitized = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      return JSON.parse(sanitized);
    } catch (secondErr) {
      console.error('Failed to parse clean JSON from AI output:', rawText);
      return { messages: [rawText] };
    }
  }
}

// Simple intent classifier — runs locally, no API call needed
function classifyIntent(message: string): 'greeting' | 'data_query' | 'recording' | 'general' {
  const msg = message.toLowerCase().trim();

  const greetingPatterns = /^(halo|hai|hi|hey|hello|pagi|siang|sore|malam|selamat|apa kabar|makasih|terima kasih|thanks|ok|oke|siap|good|morning|mantap|baik|iya|ya|yap|oke deh|ga|gak|tidak|nanti|bye|dah|wkwk|haha|lol|😊|👍|🙏|❤️|😂|🤣)$/;
  if (greetingPatterns.test(msg) || msg.length <= 5) return 'greeting';

  const recordingPatterns = /\b(beli|bayar|jual|terima|gaji|transfer|kirim|setor|tarik|belanja|makan|kopi|bensin|pulsa|parkir|ojek|grab|gojek|shopee|toko|pasar|warung|sewa|cicilan|angsuran|tabung)\b/i;
  const amountPatterns = /\b\d+[.,]?\d*\s*(rb|ribu|jt|juta|k|rbu|rebu)?\b/i;
  if (recordingPatterns.test(msg) && amountPatterns.test(msg)) return 'recording';

  const queryPatterns = /\b(berapa|total|ringkasan|laporan|statistik|grafik|chart|analisis|kategori|pengeluaran|pemasukan|tabungan|bulan ini|minggu ini|hari ini|rekap|summary|report|tren|trend)\b/i;
  if (queryPatterns.test(msg)) return 'data_query';

  return 'general';
}

function buildGreetingPrompt(userName: string, userMessage: string): string {
  return `
Kamu adalah Asisten Keuangan Personal yang ramah dan hangat. Nama user: ${userName}.

User mengirim sapaan: "${userMessage}"

Balas dengan sapaan hangat dan singkat (1 bubble pesan), tanyakan apa yang bisa kamu bantu.

Format JSON (WAJIB MURNI JSON):
{
  "messages": ["Balasan singkat dan hangat"],
  "follow_up_question": "Pertanyaan ringan 1 kalimat",
  "extracted_data": null,
  "reasoning": "",
  "chart": null,
  "location": null,
  "sources": []
}
`;
}

function buildFullPrompt(context: ChatOrchestrationContext): string {
  const parts: string[] = [];
  parts.push(`Nama User: ${context.userName || 'User'}`);
  parts.push(`Waktu Sekarang: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} (WIB)`);

  if (context.chatHistory?.length) {
    const recentHistory = context.chatHistory.slice(0, 5).map(h => `${h.role}: ${h.content?.substring(0, 150)}`);
    parts.push(`Riwayat Percakapan Terakhir:\n${recentHistory.join('\n')}`);
  }

  if (context.recentTransactions?.length) {
    const slimTxs = context.recentTransactions.slice(0, 10).map(t => ({
      amount: t.amount,
      type: t.type,
      merchant: t.merchant,
      description: t.description,
      occurred_at: t.occurred_at,
    }));
    parts.push(`Transaksi Terakhir: ${JSON.stringify(slimTxs)}`);
  }

  if (context.recentActivities?.length) {
    const slimActs = context.recentActivities.slice(0, 5).map(a => ({
      title: a.title,
      occurred_at: a.occurred_at,
    }));
    parts.push(`Aktivitas Terakhir: ${JSON.stringify(slimActs)}`);
  }

  if (context.preferences?.length) {
    const slimPrefs = context.preferences.slice(0, 5).map(p => `${p.key}: ${p.value}`);
    parts.push(`Preferensi: ${slimPrefs.join(', ')}`);
  }

  const existingCats = context.existingCategories?.length
    ? `\nKATEGORI YANG SUDAH ADA: ${JSON.stringify(context.existingCategories)}\nGunakan kategori ini jika cocok.`
    : '';

  return `
Kamu adalah Asisten Keuangan & Aktivitas Personal yang ramah, solutif, dan cerdas.

KONTEKS USER:
${parts.join('\n')}
${existingCats}

PESAN BARU DARI USER:
"${context.userMessage}"

TUGAS KAMU:
1. Analisis pesan user. Jika mengandung pencatatan keuangan, aktivitas/agenda, atau preferensi baru, ekstraksi datanya ke \`extracted_data\`.
2. Untuk pencatatan aktivitas/agenda (seperti jadwal rapat, ingatkan print, dll), ekstraksi ke \`extracted_data.activity\`.
3. Hasilkan 1-2 pesan bubble (\`messages\`) balasan yang alami, hangat, dan solutif.
4. Sediakan 1 pertanyaan lanjutan (\`follow_up_question\`) singkat.

FORMAT OUTPUT (WAJIB JSON VALID TANPA MARKDOWN BACKTICKS):
{
  "messages": ["Bubble pesan 1"],
  "follow_up_question": "Pertanyaan lanjutan?",
  "extracted_data": {
    "transaction": null,
    "activity": null,
    "preference": null
  },
  "reasoning": "Alasan singkat",
  "chart": null,
  "location": null,
  "sources": []
}
`;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallbackMessage: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`TIMEOUT: ${fallbackMessage}`)), timeoutMs);
  });
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer!);
    return result;
  } catch (error) {
    clearTimeout(timer!);
    throw error;
  }
}

const GEMINI_TIMEOUT_MS = 15_000;

// Automatic exponential backoff retry for gemini-3.6-flash (up to 3 retries: 1s, 2s, 3s)
async function generateContentWithRetry(prompt: string): Promise<any> {
  const maxRetries = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const apiCall = ai.models.generateContent({
        model: PRIMARY_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      return await withTimeout(apiCall, GEMINI_TIMEOUT_MS, `Gemini API (${PRIMARY_MODEL}) timeout`);
    } catch (err: any) {
      lastError = err;
      const errStr = String(err?.message || err || '');

      // Retry on 503 (High Demand / Spike) or 429 (Rate Limit)
      if (
        (errStr.includes('503') || errStr.includes('UNAVAILABLE') || errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED')) &&
        attempt < maxRetries
      ) {
        const delayMs = attempt * 1200; // 1.2s, 2.4s backoff
        console.warn(`Gemini 3.6 Flash busy/limited (attempt ${attempt}/${maxRetries}), retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

      throw err;
    }
  }

  throw lastError;
}

export async function runChatOrchestration(
  context: ChatOrchestrationContext
): Promise<ChatOrchestrationResult> {
  const intent = classifyIntent(context.userMessage);

  const prompt = intent === 'greeting'
    ? buildGreetingPrompt(context.userName || 'User', context.userMessage)
    : buildFullPrompt(context);

  try {
    const response = await generateContentWithRetry(prompt);
    const text = response.text || '';
    const parsed = cleanAndParseJSON(text);

    return {
      messages: Array.isArray(parsed.messages)
        ? parsed.messages
        : [typeof parsed.messages === 'string' ? parsed.messages : text || 'Selesai.'],
      follow_up_question: parsed.follow_up_question || '',
      extracted_data: parsed.extracted_data || null,
      reasoning: parsed.reasoning || '',
      chart: parsed.chart || null,
      location: parsed.location || null,
      sources: parsed.sources || [],
    };
  } catch (error: any) {
    console.error('Chat orchestration error:', error);
    const errStr = String(error?.message || error || '');

    if (errStr.includes('TIMEOUT')) {
      return {
        messages: [
          '⏳ Maaf, AI sedang sibuk dan tidak merespons tepat waktu.',
          'Coba kirim ulang pesan kamu ya! 🙏',
        ],
        follow_up_question: '',
        extracted_data: null,
      };
    }

    if (errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('Quota exceeded') || errStr.includes('503') || errStr.includes('UNAVAILABLE')) {
      return {
        messages: [
          '⏳ Server AI Google Gemini sedang mengalami lonjakan trafik singkat.',
          'Sistem otomatis mencoba ulang. Silakan kirim ulang pesan kamu dalam beberapa detik ya! 🙏',
        ],
        follow_up_question: '',
        extracted_data: null,
      };
    }

    return {
      messages: ['Maaf, terjadi kesalahan saat memproses pesan kamu.'],
      follow_up_question: 'Bisa tolong diulangi lagi?',
      extracted_data: null,
    };
  }
}
