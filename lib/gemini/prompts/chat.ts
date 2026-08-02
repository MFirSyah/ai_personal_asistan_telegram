import { ai, DEFAULT_MODEL } from '../client';

export interface ChatOrchestrationContext {
  userMessage: string;
  recentTransactions: any[];
  recentActivities: any[];
  activePlans: any[];
  preferences: any[];
  chatHistory: any[];
  userName?: string;
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

export async function runChatOrchestration(
  context: ChatOrchestrationContext
): Promise<ChatOrchestrationResult> {
  const prompt = `
Kamu adalah Asisten Keuangan & Aktivitas Personal yang ramah, solutif, dan cerdas.

KONTEKS USER:
Nama User: ${context.userName || 'User'}
Preferensi User: ${JSON.stringify(context.preferences || [])}
Transaksi Terakhir: ${JSON.stringify(context.recentTransactions || [])}
Aktivitas Terakhir: ${JSON.stringify(context.recentActivities || [])}
Rencana Aktif: ${JSON.stringify(context.activePlans || [])}
Riwayat Percakapan (Pesan Terakhir): ${JSON.stringify(context.chatHistory || [])}

PESAN BARU DARI USER:
"${context.userMessage}"

TUGAS KAMU:
1. Analisis pesan user. Jika mengandung pencatatan keuangan (pengeluaran/pemasukan), aktivitas, atau preferensi baru, ekstraksi datanya ke \`extracted_data\`.
2. Jika user meminta grafik/visualisasi sederhana, buat konfigurasi \`chart\`.
3. Jika user menanyakan lokasi atau tempat tertentu dan kamu tahu koordinatnya, sertakan di \`location\`.
4. Hasilkan 1-3 pesan bubble (\`messages\`) balasan yang alami, hangat, kontekstual, dan solutif.
5. Sediakan 1 pertanyaan lanjutan (\`follow_up_question\`) di akhir untuk mendorong diskusi yang bermanfaat.

FORMAT OUTPUT:
Kamu WAJIB mengembalikan JSON valid persis dengan struktur ini:
{
  "messages": ["Bubble pesan 1", "Bubble pesan 2 (opsional)"],
  "follow_up_question": "Pertanyaan pemantik lanjutan?",
  "extracted_data": {
    "transaction": null,
    "activity": null,
    "preference": null
  },
  "reasoning": "Alasan singkat di balik saran atau ekstraksi data",
  "chart": null,
  "location": null,
  "sources": []
}

Contoh extracted_data transaction:
{
  "amount": 25000,
  "type": "expense",
  "category": "Makanan & Minuman",
  "merchant": "Kopi Janji Jiwa",
  "description": "Beli es kopi susu",
  "occurred_at": "${new Date().toISOString()}"
}

Jawab HANYA dengan JSON valid tanpa markdown formatting tambahan atau pembungkus lain.
`;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    return {
      messages: Array.isArray(parsed.messages) ? parsed.messages : [text],
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

    if (errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED') || errStr.includes('Quota exceeded')) {
      return {
        messages: [
          '⏳ Maaf, kuota/rate-limit AI Gemini dari Google sedang mencapai batas gratis per menitnya.',
          'Mohon tunggu sekitar 30 detik sebelum mencoba mengirim pesan kembali ya! 🙏',
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
