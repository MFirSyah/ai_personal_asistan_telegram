import { ai, generateContentWithFallback } from '../client';

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
    preferences?: Array<{
      key: string;
      value: string;
      learned_from?: string;
    }> | null;
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
    update_timestamps?: {
      targetDate?: string;
      startHour?: number;
      endHour?: number;
      target?: 'transactions' | 'activities' | 'all';
    } | null;
    edit_record?: {
      id: string; // e.g. "TX-8F3A" or "ACT-4E91" or UUID
      type: 'transaction' | 'activity';
      changes: {
        amount?: number;
        merchant?: string;
        description?: string;
        title?: string;
        type?: 'expense' | 'income';
        status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
        priority?: 'low' | 'medium' | 'high' | 'urgent';
        occurred_at?: string;
      };
    } | null;
    delete_record?: {
      id: string; // e.g. "TX-8F3A" or "ACT-4E91" or UUID
      type: 'transaction' | 'activity';
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

  let parsedObj: any = null;

  // Attempt 1: Standard JSON parse
  try {
    parsedObj = JSON.parse(cleaned);
  } catch (err1) {
    // Attempt 2: Fix unescaped control characters and newlines in JSON strings
    try {
      const sanitized = cleaned
        .replace(/[\r\n\t]/g, (match) => (match === '\r' ? '' : match === '\n' ? '\\n' : '\\t'))
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      parsedObj = JSON.parse(sanitized);
    } catch (err2) {
      // Attempt 3: Regex extraction of messages and fields
      console.warn('JSON.parse failed on AI output. Using regex extraction fallback.');
      
      const msgMatch = cleaned.match(/"messages"\s*:\s*(?:\[([\s\S]*?)\]|"([\s\S]*?)"(?=\s*,\s*"|\s*\}))/i);
      let messagesArr: string[] = [];

      if (msgMatch) {
        if (msgMatch[1]) {
          // Matched an array format
          const rawItems = msgMatch[1].match(/"([^"\\]*(?:\\.[^"\\]*)*)"/g);
          if (rawItems) {
            messagesArr = rawItems.map((item) =>
              item
                .replace(/^"/, '')
                .replace(/"$/, '')
                .replace(/\\n/g, '\n')
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\')
            );
          }
        } else if (msgMatch[2]) {
          // Matched a single string format
          messagesArr = [
            msgMatch[2]
              .replace(/\\n/g, '\n')
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, '\\'),
          ];
        }
      }

      const followUpMatch = cleaned.match(/"follow_?up_?question"\s*:\s*"([\s\S]*?)"(?=\s*,\s*"|\s*\})/i);
      const followUpStr = followUpMatch ? followUpMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '';

      if (messagesArr.length > 0) {
        return {
          messages: messagesArr,
          follow_up_question: followUpStr,
          extracted_data: null,
        };
      }

      // Final emergency fallback: strip JSON braces/keys and return plain text
      const plainText = cleaned
        .replace(/"(messages|follow_up_question|extracted_data|reasoning|chart|location|sources)"\s*:\s*/gi, '')
        .replace(/[{}\[\]"]/g, '')
        .trim();

      return { messages: [plainText || 'Maaf, terjadi masalah format balasan. Silakan coba lagi.'] };
    }
  }

  // Normalize key names (handle lowercase / variations like followupquestion, extracteddata)
  if (parsedObj && typeof parsedObj === 'object') {
    const normalized: any = {};
    for (const key of Object.keys(parsedObj)) {
      const lowerKey = key.toLowerCase().replace(/_/g, '');
      if (lowerKey === 'messages') normalized.messages = parsedObj[key];
      else if (lowerKey === 'followupquestion') normalized.follow_up_question = parsedObj[key];
      else if (lowerKey === 'extracteddata') normalized.extracted_data = parsedObj[key];
      else if (lowerKey === 'reasoning') normalized.reasoning = parsedObj[key];
      else if (lowerKey === 'chart') normalized.chart = parsedObj[key];
      else if (lowerKey === 'location') normalized.location = parsedObj[key];
      else normalized[key] = parsedObj[key];
    }

    // Convert single string "messages" to string array
    if (typeof normalized.messages === 'string') {
      // Decode escaped newlines \n in string if any
      const cleanedMsg = normalized.messages.replace(/\\n/g, '\n');
      normalized.messages = [cleanedMsg];
    }

    return normalized;
  }

  return parsedObj || {};
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
    const slimTxs = context.recentTransactions.slice(0, 15).map(t => {
      const shortId = `TX-${t.id.replace(/-/g, '').substring(0, 6).toUpperCase()}`;
      return {
        id: shortId,
        full_id: t.id,
        amount: t.amount,
        type: t.type,
        merchant: t.merchant,
        description: t.description,
        occurred_at: t.occurred_at,
      };
    });
    parts.push(`Transaksi Terakhir (dengan ID unik): ${JSON.stringify(slimTxs)}`);
  }

  if (context.recentActivities?.length) {
    const slimActs = context.recentActivities.slice(0, 10).map(a => {
      const shortId = `ACT-${a.id.replace(/-/g, '').substring(0, 6).toUpperCase()}`;
      return {
        id: shortId,
        full_id: a.id,
        title: a.title,
        status: a.status,
        priority: a.priority,
        occurred_at: a.occurred_at,
      };
    });
    parts.push(`Aktivitas Terakhir (dengan ID unik): ${JSON.stringify(slimActs)}`);
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
1. **ATURAN MUTLAK 0% HALUSINASI & DATA DUMMY**:
   - **DILARANG KERAS BERBOHONG / BERHALUSINASI MENYATAKAN DATA SUDAH TERSIMPAN DI DATABASE**: JANGAN PERNAH memberikan pesan balasan yang mengklaim *"data sudah tersimpan di database"* atau *"sudah dicatat di sistem"* KECUALI kamu benar-benar mengisi objek \`extracted_data.transactions\` atau \`extracted_data.activities\` pada JSON output!
   - **WAJIB EKSPLISIT EKSTRAKSI TRANSAKSI JIKA USER MEMINTA/MENYETUJUI SIMPAN DATA**: Jika user meminta atau mengonfirmasi pencatatan nominal uang/saldo (misal: *"simpan di database saja"*, *"catat sekarang"*, *"tulis ulang"*, *"masukkan 208rb ke database"*), KAMU WAJIB EKSPLISIT MENGEKSTRAK NOMINAL TERSEBUT KE DALAM ARRAY \`extracted_data.transactions\` (sebagai type 'income' atau 'expense') agar benar-benar masuk ke database Supabase!
   - **TIDAK BOLEH REKAYASA/REKABUT DATA DUMMY**: DILARANG KERAS mengarang, mengada-ada, atau merekayasa data transaksi/aktivitas palsu jika array pada KONTEKS USER kosong (\`[]\`). Selalu gunakan HANYA data yang benar-benar ada di database!
   - **PROAKTIF TANYA NAMA PANGGILAN**: Jika \`Nama User\` masih berstatus default ("User" atau "Teman"), sapa user dengan hangat dan tanyakan nama panggilannya secara sopan agar bisa kamu simpan ke memori preferensi!
   - **PROAKTIF TANYA PENGISIAN DATA JIKA DATABASE KOSONG**:
     - Jika user menanyakan data keuangan/transaksi tetapi database transaksi kosong (\`[]\`), sampaikan dengan jujur bahwa belum ada catatan keuangan di database, lalu tanyakan transaksi pertama yang ingin dicatat!
     - Jika user menanyakan agenda/aktivitas tetapi database aktivitas kosong (\`[]\`), sampaikan dengan jujur bahwa belum ada catatan agenda di database, lalu tanyakan agenda/aktivitas pertama yang mau dijadwalkan!
2. Analisis pesan user. Jika pesan berisi BANYAK transaksi keuangan atau aktivitas sekaligus (misalnya berupa teks panjang / jurnal harian), ekstraksi SEMUA transaksi ke dalam ARRAY \`extracted_data.transactions\` dan SEMUA aktivitas ke dalam ARRAY \`extracted_data.activities\`. JANGAN HANYA MENGAMBIL 1 ITEM!
3. Jika user menyebutkan **PREFERENSI KOMUNIKASI, FORMAT PESAN (bullet point •, emoji, gaya bahasa santai/formal, panggilan, dll.)**, KAMU WAJIB mengekstraknya ke ARRAY \`extracted_data.preferences\`!
4. **MENGEDIT DATA TERTENTU DENGAN ID UNIK (\`edit_record\`)**:
   - Jika user meminta mengedit / mengubah suatu data transaksi atau aktivitas tertentu (misal: "edit transaksi TX-8F3A nominalnya 60rb", "ubah status agenda ACT-4E91 jadi selesai", "ganti merchant TX-A1B2 jadi Warung Bu Edi"), KAMU WAJIB MENGEKSTRAK \`extracted_data.edit_record\`:
     \`"edit_record": { "id": "TX-8F3A", "type": "transaction", "changes": { "amount": 60000 } }\`
5. **MENGHAPUS DATA TERTENTU DENGAN ID UNIK (\`delete_record\`)**:
   - Jika user meminta menghapus data spesifik berdasarkan ID (misal: "hapus transaksi TX-8F3A", "hapus agenda ACT-4E91"), KAMU WAJIB MENGEKSTRAK \`extracted_data.delete_record\`:
     \`"delete_record": { "id": "TX-8F3A", "type": "transaction" }\`
6. Jika user menanyakan **LOKASI, RUTE, ATAU PETUNJUK ARAH KE SUATU TEMPAT** (misal: "aku mau ke unesa lidah", "rute ke pasar kletek", "lokasi XXI Sidoarjo"):
   a) KAMU WAJIB menyertakan link Google Maps langsung di dalam bubble balasan (\`messages\`), contoh:
      \`[🗺️ Buka Google Maps](https://www.google.com/maps/search/?api=1&query=UNESA+Lidah+Wetan+Surabaya)\`
   b) Serta mengisikan objek \`location\` pada JSON output:
      \`"location": { "name": "UNESA Lidah Wetan", "lat": -7.3006, "lng": 112.6744 }\`
7. **ATURAN EKSPLISIT TANGGAL (\`occurred_at\`)**:
   - Jika user TIDAK menyebutkan tanggal secara eksplisit, KAMU WAJIB MENGGUNAKAN ISO WAKTU SEKARANG: \`${new Date().toISOString()}\`! JANGAN PERNAH MENYALIN DUMMY DATE TANGGAL 1 JANUARI!
   - Jika user menyebutkan "kemarin", hitung tanggal H-1 dari Waktu Sekarang.
8. Jika user meminta **MENGHAPUS SEMUA DATA** (misal: "hapus semua data saya", "kosongkan data", "reset data"), set \`extracted_data.delete_all_request = true\`.
9. Jika user meminta **EXPORT DATA KE EXCEL/CSV** (misal: "bantu export transaksi tanggal X ke Y", "export data Alfamart"), set \`extracted_data.export_request\`.
10. Jika user meminta **MENGUBAH / MENGACAK TANGGAL & JAM TRANSAKSI/AKTIVITAS** (misal: "ubah semua transaksi ke tanggal hari ini", "acak jam transaksi dari jam 8 sampai 20"), set \`extracted_data.update_timestamps\`.
11. Kamu **WAJIB MEMATUHI SEMUA PREFERENSI & CATATAN MEMORI PENGGUNA** yang ada dalam konteks (seperti format bullet point •, gaya bahasa, panggilan nama).
12. **SANGAT PENTING - DILARANG MENYAPA ULANG / GREETING LOOP ON SHORT AFFIRMATION**:
    - JANGAN PERNAH menyapa ulang user dengan kata-kata pembuka generik seperti *"Halo [Nama]! Senang bisa ngobrol lagi."* jika obrolan sedang berjalan!
13. **MEMBUAT GRAFIK / CHART GAMBAR + PENJELASAN**:
    - Jika user meminta dibuatkan grafik/chart/visualisasi (misal: "buatkan grafik pengeluaran", "tampilkan chart minggu ini", "visualisasikan pengeluaran per kategori"), KAMU WAJIB:
      a) Mengisi objek \`"chart"\` dengan data aktual dari database:
         \`"chart": { "type": "bar", "title": "Grafik Pengeluaran", "labels": ["Makanan", "Transport"], "datasets": [{ "label": "Nominal (Rp)", "data": [150000, 50000] }] }\` (pilih \`"type"\`: \`"bar"\`, \`"line"\`, atau \`"pie"\`).
      b) Menyertakan penjelasan ringkas, analisis tren, dan wawasan detail di dalam bubble balasan (\`messages\`).
14. Hasilkan 1-2 pesan bubble (\`messages\`) balasan yang alami, hangat, dan solutif. Sebutkan ID unik yang diedit/dihapus dalam pesan balasan jika ada.
15. Sediakan 1 pertanyaan lanjutan (\`follow_up_question\`) singkat.

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
        "occurred_at": "${new Date().toISOString()}"
      }
    ],
    "activities": [
      {
        "title": "Sidang Skripsi",
        "category": "Akademik",
        "description": "Sidang akhir",
        "priority": "urgent",
        "tags": ["skripsi"],
        "occurred_at": "${new Date().toISOString()}"
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

    let finalMessages: string[] = [];
    if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
      finalMessages = parsed.messages.map((m: any) => String(m || ''));
    } else if (typeof parsed.messages === 'string') {
      finalMessages = [parsed.messages];
    } else {
      finalMessages = ['Selesai.'];
    }

    // Safety filter: If any message still looks like raw JSON, extract text
    finalMessages = finalMessages.map((msgStr) => {
      let str = msgStr.trim();
      if (str.startsWith('{') && str.endsWith('}')) {
        const matchMsg = str.match(/"messages"\s*:\s*(?:"([\s\S]*?)"|\[([\s\S]*?)\])/i);
        if (matchMsg) {
          const rawContent = matchMsg[1] || matchMsg[2] || '';
          str = rawContent
            .replace(/^"/, '')
            .replace(/"$/, '')
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"');
        }
      }
      return str;
    });

    return {
      messages: finalMessages,
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
