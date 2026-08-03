import { ai } from '../client';

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
    transactions?: Array<{
      amount: number;
      type: 'expense' | 'income';
      category: string;
      merchant?: string;
      description?: string;
      payment_method?: string;
      location?: string;
      items?: any[];
      tags?: string[];
      occurred_at?: string;
    }> | null;
    transaction?: {
      amount: number;
      type: 'expense' | 'income';
      category: string;
      merchant?: string;
      description?: string;
      payment_method?: string;
      location?: string;
      items?: any[];
      tags?: string[];
      occurred_at?: string;
    } | null;
    activities?: Array<{
      title: string;
      category?: string;
      description?: string;
      status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      tags?: string[];
      occurred_at?: string;
    }> | null;
    activity?: {
      title: string;
      category?: string;
      description?: string;
      status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      tags?: string[];
      occurred_at?: string;
    } | null;
    preference?: {
      key: string;
      value: string;
      learned_from?: string;
    } | null;
    cancel_transaction?: {
      amount?: number;
      type?: 'expense' | 'income';
    } | null;
    delete_all_request?: boolean | null;
    export_request?: {
      target?: 'transactions' | 'activities' | 'all';
      startDate?: string;
      endDate?: string;
      merchant?: string;
      paymentMethod?: string;
      category?: string;
      sortByPriority?: boolean;
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
    const recentHistory = context.chatHistory.map(h => `[${h.role.toUpperCase()}]: ${h.content}`);
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
    const slimPrefs = context.preferences.slice(0, 20).map(p => `${p.key}: ${p.value}`);
    parts.push(`Preferensi & Catatan Memori Pengguna:\n${slimPrefs.join('\n')}`);
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
1. Analisis pesan user. Jika pesan berisi BANYAK transaksi keuangan atau aktivitas sekaligus (misalnya berupa teks panjang / jurnal harian), ekstraksi SEMUA transaksi ke dalam ARRAY \`extracted_data.transactions\` dan SEMUA aktivitas ke dalam ARRAY \`extracted_data.activities\`. JANGAN HANYA MENGAMBIL 1 ITEM!
2. Jika user menyebutkan **PREFERENSI KOMUNIKASI, FORMAT PESAN (bullet point •, emoji, gaya bahasa santai/formal, panggilan, dll.)**, KAMU WAJIB mengekstraknya ke ARRAY \`extracted_data.preferences\`!
   Contoh:
   \`"preferences": [\`
     \`{ "key": "format_poin", "value": "Menggunakan format bullet point (•) untuk ringkasan", "learned_from": "Permintaan user di chat" },\`
     \`{ "key": "gaya_bicara", "value": "Gaya bahasa santai, akrab, dan hangat", "learned_from": "Permintaan user di chat" }\`
   \`]\`
3. Jika user menanyakan **LOKASI, RUTE, ATAU PETUNJUK ARAH KE SUATU TEMPAT** (misal: "aku mau ke unesa lidah", "rute ke pasar kletek", "lokasi XXI Sidoarjo"):
   a) KAMU WAJIB menyertakan link Google Maps langsung di dalam bubble balasan (\`messages\`), contoh:
      \`[🗺️ Buka Google Maps](https://www.google.com/maps/search/?api=1&query=UNESA+Lidah+Wetan+Surabaya)\`
   b) Serta mengisikan objek \`location\` pada JSON output:
      \`"location": { "name": "UNESA Lidah Wetan", "lat": -7.3006, "lng": 112.6744 }\`
4. Jika user ingin **membatalkan / menghapus / merevisi** transaksi (misal: "batalkan transaksi tadi", "hapus 50rb tadi"), set \`extracted_data.cancel_transaction\`. Jika user meminta **MENGHAPUS SEMUA DATA** (misal: "hapus semua data saya", "kosongkan data", "reset data"), set \`extracted_data.delete_all_request = true\`.
5. Jika user meminta **EXPORT DATA KE EXCEL/CSV** (misal: "bantu export transaksi tanggal X ke Y", "export data Alfamart"), set \`extracted_data.export_request\`.
6. Kamu **WAJIB MEMATUHI SEMUA PREFERENSI & CATATAN MEMORI PENGGUNA** yang ada dalam konteks (seperti format bullet point •, gaya bahasa, panggilan nama).
7. **SANGAT PENTING - DILARANG MENYAPA ULANG / GREETING LOOP ON SHORT AFFIRMATION**:
   - JANGAN PERNAH menyapa ulang user dengan kata-kata pembuka generik seperti *"Halo [Nama]! Senang bisa ngobrol lagi. Ada yang bisa aku bantu hari ini?"* jika obrolan sedang berjalan!
   - Jika \`PESAN BARU DARI USER\` berisi kata persetujuan / konfirmasi singkat (seperti *"Mau"*, *"Boleh"*, *"Iya"*, *"Oke"*, *"Siap"*, *"Lanjutkan"*), kamu **WAJIB LANGSUNG MEMENUHI & MEMBERIKAN DETAIL RINCIAN**!
8. Hasilkan 1-2 pesan bubble (\`messages\`) balasan yang alami, hangat, dan solutif.
9. Sediakan 1 pertanyaan lanjutan (\`follow_up_question\`) singkat.

FORMAT OUTPUT (WAJIB JSON VALID TANPA MARKDOWN BACKTICKS):
{
  "messages": ["Bubble pesan 1"],
  "follow_up_question": "Pertanyaan lanjutan?",
  "extracted_data": {
    "transactions": [
      {
        "amount": 50000,
        "type": "expense",
        "category": "Makanan",
        "merchant": "Warung",
        "description": "Makan siang",
        "payment_method": "QRIS",
        "tags": ["harian"],
        "items": [],
        "occurred_at": "2026-06-01T12:00:00Z"
      }
    ],
    "activities": [
      {
        "title": "Sidang Skripsi",
        "category": "Akademik",
        "description": "Sidang akhir",
        "priority": "urgent",
        "tags": ["skripsi"],
        "occurred_at": "2026-06-01T09:00:00Z"
      }
    ],
    "preferences": [
      {
        "key": "format_poin",
        "value": "Menggunakan format bullet point (•)",
        "learned_from": "User meminta di chat"
      }
    ],
    "preference": null,
    "cancel_transaction": null,
    "delete_all_request": null,
    "export_request": null
  },
  "reasoning": "Alasan singkat",
  "chart": null,
  "location": {
    "name": "UNESA Lidah Wetan",
    "lat": -7.3006,
    "lng": 112.6744
  },
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

import { generateContentWithFallback } from '../client';

export async function runChatOrchestration(
  context: ChatOrchestrationContext
): Promise<ChatOrchestrationResult> {
  const intent = classifyIntent(context.userMessage);

  const prompt = intent === 'greeting'
    ? buildGreetingPrompt(context.userName || 'User', context.userMessage)
    : buildFullPrompt(context);

  try {
    const { response, usedModel } = await generateContentWithFallback(
      prompt,
      { responseMimeType: 'application/json' },
      15_000
    );
    console.log(`[Chat Orchestration] Handled successfully using model: ${usedModel}`);
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
