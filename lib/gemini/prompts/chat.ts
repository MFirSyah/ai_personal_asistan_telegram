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
    plans?: Array<{
      title: string;
      description?: string;
      target_date?: string;
      status?: 'planned' | 'in_progress' | 'done' | 'cancelled';
      budget_total?: number;
      budget_breakdown?: Array<{ item: string; amount: number; note?: string }>;
      strategy?: string;
    }> | null;
    plan?: {
      title: string;
      description?: string;
      target_date?: string;
      status?: 'planned' | 'in_progress' | 'done' | 'cancelled';
      budget_total?: number;
      budget_breakdown?: Array<{ item: string; amount: number; note?: string }>;
      strategy?: string;
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
  locations?: Array<{
    name: string;
    category?: string;
    address?: string;
    lat: number;
    lng: number;
    description: string;
    highlights?: string;
    price_range?: string;
    google_maps_url?: string;
  }> | null;
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
  "locations": [
    {
      "name": "Alun-Alun Tugu Malang",
      "category": "Wisata Sejarah & Ikon Kota",
      "address": "Jl. Tugu, Kiduldalem, Klojen, Kota Malang",
      "lat": -7.9772,
      "lng": 112.6341,
      "description": "Ikon tugu bersejarah dikelilingi kolam teratai dan lampu taman estetik.",
      "highlights": "Kolam teratai, spot foto tugu, area jalan santai",
      "price_range": "Gratis (Parkir Rp 2.000)",
      "google_maps_url": "https://www.google.com/maps/search/?api=1&query=-7.9772,112.6341"
    },
    {
      "name": "Kampung Warna-Warni Jodipan",
      "category": "Wisata Edukasi & Spot Foto",
      "address": "Gang 1, Jodipan, Blimbing, Kota Malang",
      "lat": -7.9835,
      "lng": 112.6375,
      "description": "Perkampungan tematik di bantaran sungai dengan jembatan kaca ikonik.",
      "highlights": "Jembatan kaca, lorong warna-warni, lukisan 3D",
      "price_range": "Tiket Masuk Rp 5.000",
      "google_maps_url": "https://www.google.com/maps/search/?api=1&query=-7.9835,112.6375"
    },
    {
      "name": "Kawasan Kayutangan Heritage",
      "category": "Wisata Sejarah & Kafe Retro",
      "address": "Jl. Jenderal Basuki Rahmat, Kauman, Klojen, Kota Malang",
      "lat": -7.9788,
      "lng": 112.6301,
      "description": "Pusat kawasan kota tua dengan deretan kafe estetik tempo dulu dan arsitektur kolonial.",
      "highlights": "Bangunan kolonial, kafe vintage, spot jalan malam",
      "price_range": "Area Publik Gratis (F&B Rp 15.000 - Rp 40.000)",
      "google_maps_url": "https://www.google.com/maps/search/?api=1&query=-7.9788,112.6301"
    },
    {
      "name": "Pasar Senggol Kuliner Malam Oro-Oro Dowo",
      "category": "Pusat Kuliner Legendaris",
      "address": "Jl. Guntur No.20, Oro-oro Dowo, Klojen, Kota Malang",
      "lat": -7.9701,
      "lng": 112.6288,
      "description": "Sentra kuliner legendaris dengan aneka jajanan pasar, bakso bakar, dan wedang ronde.",
      "highlights": "Jajanan tradisional, bakso bakar legendaris, wedang jahe",
      "price_range": "Rp 10.000 - Rp 25.000",
      "google_maps_url": "https://www.google.com/maps/search/?api=1&query=-7.9701,112.6288"
    },
    {
      "name": "Museum Angkut & Jatim Park Zone",
      "category": "Wisata Rekreasi & Transportasi",
      "address": "Jl. Terusan Sultan Agung No.2, Ngaglik, Kota Batu",
      "lat": -7.8785,
      "lng": 112.5186,
      "description": "Museum transportasi modern pertama di Asia Tenggara dengan zona tematik dunia.",
      "highlights": "Koleksi mobil klasik dunia, zona Gangster Broadway, pasar apung",
      "price_range": "Tiket Masuk Rp 100.000 - Rp 120.000",
      "google_maps_url": "https://www.google.com/maps/search/?api=1&query=-7.8785,112.5186"
    }
  ],
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
    const slimPrefs = context.preferences.slice(0, 25).map(p => `${p.key}: ${p.value}`);
    parts.push(`Preferensi & Catatan Memori Pengguna:\n${slimPrefs.join('\n')}`);
  }

  if (context.activePlans?.length) {
    const slimPlans = context.activePlans.map(p => {
      return `• [PLAN: ${p.title}] Target: ${p.target_date || 'N/A'} | Status: ${p.status} | Budget: Rp ${p.budget_total || 0} | Detail: ${p.description || '-'}`;
    });
    parts.push(`Rencana, Target Hidup & Liburan Aktif (Plans):\n${slimPlans.join('\n')}`);
  }

  const existingCats = context.existingCategories?.length
    ? `\nKATEGORI YANG SUDAH ADA: ${JSON.stringify(context.existingCategories)}\nGunakan kategori ini jika cocok.`
    : '';

  return `
Kamu adalah Royal Butler & Asisten Pribadi Eksekutif (Personal Financial & Schedule Butler) bagi Mas Firman.
GAYA KOMUNIKASI & PERSONA BUTLER EKSEKUTIF:
- Selalu bersikap sangat sopan, taktis, sigap, proaktif, dan protektif terhadap kesehatan keuangan serta efisiensi waktu Mas Firman.
- Sapa pengguna secara terhormat (contoh: "Selamat siang Mas Firman" atau "Izin menyampaikan analisis keuangan, Mas Firman").
- DILARANG KERAS MENYAPA ULANG DENGAN KALIMAT KAKU JIKA OBROLAN SEDANG BERLANGSUNG (0% GREETING LOOP).
- ANTI-SPAM & ANTI-DUPLIKASI: Hasilkan 1-2 bubble pesan padat dan elegan. DILARANG KERAS mengulang-ulang pertanyaan penutup yang sama dalam beberapa bubble terpisah. Jika sudah menyertakan pertanyaan di akhir bubble pesan utama, kosongkan \`follow_up_question\` ("").

KONTEKS USER:
${parts.join('\n')}
${existingCats}

PESAN BARU DARI USER:
"${context.userMessage}"

TUGAS KAMU:
1. **ATURAN MUTLAK 0% HALUSINASI & DATA DUMMY**:
   - **DILARANG KERAS BERBOHONG / BERHALUSINASI MENGENAI ANGGARAN & RENCANA**: JANGAN PERNAH mengarang-ngarang angka rencana/liburan (seperti Plan Dieng). Selalu rujuk data yang tersimpan di Rencana Aktif (Plans) atau riwayat chat!
   - **WAJIB EKSTRAK RENCANA / TARGET HIDUP (\`extracted_data.plans\`)**: Jika user membuat, merinci, atau merevisi rencana (misal: "plan ke dieng tiketnya naik 50rb jadi 340rb, uang jajan 500rb, perlengkapan 200rb, total 1.040.000"), KAMU WAJIB MENGEKSTRAKNYA ke \`extracted_data.plans\` agar tersimpan permanen di database Supabase!
   - **WAJIB EKSPLISIT EKSTRAKSI TRANSAKSI JIKA USER MEMINTA/MENYETUJUI SIMPAN DATA**: Jika user meminta atau mengonfirmasi pencatatan nominal uang/saldo, KAMU WAJIB EKSPLISIT MENGEKSTRAK NOMINAL TERSEBUT KE DALAM ARRAY \`extracted_data.transactions\`!
   - **TIDAK BOLEH REKAYASA/REKABUT DATA DUMMY**: DILARANG KERAS mengarang transaksi/aktivitas palsu jika array pada KONTEKS USER kosong (\`[]\`). Selalu gunakan HANYA data yang benar-benar ada di database!

2. **PENANGANAN KATA NEGASI & PENGECUALIAN ("SELAIN", "KECUALI")**:
   - Jika user memberikan instruksi dengan kata pengecualian seperti *"selain poin A, B, C statusnya selesai"* atau *"kecuali wisuda dan bayar hutang, tandai selesai"*, KAMU HARUS CERMAT: JANGAN PERNAH menandai poin A, B, C sebagai Selesai! Poin A, B, C harus tetap berstatus \`scheduled\` (Terjadwal), sedangkan aktivitas LAINNYA yang ditandai selesai.

3. **STRUKTUR DOMPET & MUTASI PINJAMAN**:
   - Pisahkan pencatatan antara **Cash Kertas**, **Cash Koin**, **SeaBank**, **Bank Jago**, dan **Gopay**.
   - Untuk transfer antar dompet (misal: Jago ke Gopay, SeaBank ke Jago), catat mutasi perpindahan tanpa merusak saldo total.
   - Pahami pinjaman aktif Bank Jago: (1) Angsuran Rp 67.941/bln tgl 20; (2) Pinjaman 600rb flat 2.99% (cicilan Rp 67.940/bln tgl 20). Jangan pernah mengosongkan seluruh tagihan jika yang dibayar hanya cicilan 1 bulan.

4. **STANDARISASI FORMAT VARIABEL BOLD & IKON**:
   - Selalu letakkan ikon di sebelah kiri nama variabel.
   - HANYA nama variabel sebelum tanda titik dua yang di-bold (\`**\`). DILARANG memasukkan titik dua ke dalam bold.
   - Contoh wajib: \`• 💵 **Pengeluaran Cash**: Rp 10.000 (Es Cincau)\`

5. Analisis pesan user. Jika pesan berisi BANYAK transaksi keuangan atau aktivitas sekaligus (misalnya berupa teks panjang / jurnal harian), ekstraksi SEMUA transaksi ke dalam ARRAY \`extracted_data.transactions\` dan SEMUA aktivitas ke dalam ARRAY \`extracted_data.activities\`. JANGAN HANYA MENGAMBIL 1 ITEM!

6. Jika user menyebutkan **PREFERENSI KOMUNIKASI ATAU ATURAN FORMAT BALASAN**, KAMU WAJIB mengekstraknya ke ARRAY \`extracted_data.preferences\`.

7. **MENGEDIT DATA TERTENTU DENGAN ID UNIK (\`edit_record\`)**:
   - Jika user meminta mengedit / mengubah suatu data transaksi atau aktivitas tertentu, ekstrak \`extracted_data.edit_record\`.

8. **MENGHAPUS DATA TERTENTU DENGAN ID UNIK (\`delete_record\`)**:
   - Jika user meminta menghapus data spesifik berdasarkan ID, ekstrak \`extracted_data.delete_record\`.

9. Jika user menanyakan **LOKASI, RUTE, ATAU PETUNJUK ARAH KE SUATU TEMPAT**:
   a) Sertakan link Google Maps langsung di bubble balasan: \`[🗺️ Buka Google Maps](https://www.google.com/maps/search/?api=1&query=...)\`
   b) Serta isi objek \`location\` pada JSON output.

10. **ATURAN EKSPLISIT TANGGAL (\`occurred_at\`)**:
    - Jika user TIDAK menyebutkan tanggal secara eksplisit, gunakan ISO waktu sekarang dari konteks.

11. Jika user meminta **MENGHAPUS SEMUA DATA**, set \`extracted_data.delete_all_request = true\`.
12. Jika user meminta **EXPORT DATA KE EXCEL/CSV**, set \`extracted_data.export_request\`.
13. Jika user meminta **MENGUBAH / MENGACAK TANGGAL & JAM TRANSAKSI/AKTIVITAS**, set \`extracted_data.update_timestamps\`.

14. **MEMBUAT GRAFIK / CHART GAMBAR + PENJELASAN**:
    - Jika user meminta grafik/chart, isi objek \`"chart"\` dan sertakan analisis tren di pesan.

15. Hasilkan 1-2 pesan bubble (\`messages\`) balasan yang alami, hangat, dan solutif. **SERTAKAN ID UNIK SHORT ID** (seperti \`[TX-C8A327]\` atau \`[ACT-486088]\`) di depan setiap rincian transaksi/aktivitas yang dipaparkan dalam pesan balasan!

16. **PERBAIKAN SEMUA JAM / SINKRONISASI JAM DENGAN HISTORY CHAT (\`fix_all_timestamps_request\`)**:
    - Jika user meminta merapikan / menyamakan jam transaksi dengan waktu chat, set \`"fix_all_timestamps_request": true\`.

17. **KONSOLIDASI & REKONSILIASI SALDO DOMPET (\`reconcile_wallet_balances\`)**:
    - Jika user meminta merapikan saldo dompet atau menggabungkan pencatatan cash/dompet yang terpecah, set \`"reconcile_wallet_balances": true\`.

18. **SIMULASI KEUANGAN & PROYEKSI WAKTU (\`run_simulation_request\`)**:
    - Jika user meminta simulasi atau proyeksi, set \`"run_simulation_request"\`.

19. **ANALISIS KELAYAKAN BELI BARANG BESAR (\`check_affordability_request\`)**:
    - Jika user bertanya kelayakan membeli barang besar/mahal, set \`"check_affordability_request"\`.

20. **ANALISIS BENTROK AGENDA & TRAVEL BUFFER (\`check_schedule_conflict_request\`)**:
    - Jika user bertanya estimasi perjalanan & potensi bentrok, set \`"check_schedule_conflict_request"\`.

21. **REKOMENDASI TRIPS & BUDGET OPTIMIZER (\`optimize_trip_budget_request\`)**:
    - Jika user menyebutkan draf trip liburan, set \`"optimize_trip_budget_request"\`.

22. **ANALISIS RISIKO PINJAMAN / CREDIT STRESS TEST (\`check_loan_risk_request\`)**:
    - Jika user bertanya mengenai pinjaman/kredit, set \`"check_loan_risk_request"\`.

FORMAT OUTPUT (WAJIB JSON VALID TANPA MARKDOWN BACKTICKS):
{
  "messages": ["Bubble pesan 1"],
  "follow_up_question": "",
  "extracted_data": {
    "transactions": [
      {
        "amount": 50000,
        "type": "expense",
        "category": "Makanan",
        "merchant": "Warung",
        "description": "Makan siang",
        "payment_method": "Cash Kertas",
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
    "plans": [
      {
        "title": "Trip Ke Dieng",
        "description": "Liburan bersama rekan kerja akhir Agustus",
        "target_date": "2026-08-29",
        "status": "planned",
        "budget_total": 1040000,
        "budget_breakdown": [
          { "item": "Tiket & Paket Wisata", "amount": 340000 },
          { "item": "Uang Jajan", "amount": 500000 },
          { "item": "Perlengkapan (Baju, Celana)", "amount": 200000 }
        ],
        "strategy": "Narik Gojek harian target Rp 70.000 - Rp 85.000, pengeluaran maks Rp 25.000/hari"
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
  "location": null,
  "locations": [
    {
      "name": "Alun-Alun Tugu Malang",
      "category": "Wisata Sejarah & Ikon Kota",
      "address": "Jl. Tugu, Kiduldalem, Klojen, Kota Malang",
      "lat": -7.9772,
      "lng": 112.6341,
      "description": "Ikon tugu bersejarah dikelilingi kolam teratai dan lampu taman estetik.",
      "highlights": "Kolam teratai, spot foto tugu, area jalan santai",
      "price_range": "Gratis (Parkir Rp 2.000)",
      "google_maps_url": "https://www.google.com/maps/search/?api=1&query=-7.9772,112.6341"
    },
    {
      "name": "Kampung Warna-Warni Jodipan",
      "category": "Wisata Edukasi & Spot Foto",
      "address": "Gang 1, Jodipan, Blimbing, Kota Malang",
      "lat": -7.9835,
      "lng": 112.6375,
      "description": "Perkampungan tematik di bantaran sungai dengan jembatan kaca ikonik.",
      "highlights": "Jembatan kaca, lorong warna-warni, lukisan 3D",
      "price_range": "Tiket Masuk Rp 5.000",
      "google_maps_url": "https://www.google.com/maps/search/?api=1&query=-7.9835,112.6375"
    },
    {
      "name": "Kawasan Kayutangan Heritage",
      "category": "Wisata Sejarah & Kafe Retro",
      "address": "Jl. Jenderal Basuki Rahmat, Kauman, Klojen, Kota Malang",
      "lat": -7.9788,
      "lng": 112.6301,
      "description": "Pusat kawasan kota tua dengan deretan kafe estetik tempo dulu dan arsitektur kolonial.",
      "highlights": "Bangunan kolonial, kafe vintage, spot jalan malam",
      "price_range": "Area Publik Gratis (F&B Rp 15.000 - Rp 40.000)",
      "google_maps_url": "https://www.google.com/maps/search/?api=1&query=-7.9788,112.6301"
    },
    {
      "name": "Pasar Senggol Kuliner Malam Oro-Oro Dowo",
      "category": "Pusat Kuliner Legendaris",
      "address": "Jl. Guntur No.20, Oro-oro Dowo, Klojen, Kota Malang",
      "lat": -7.9701,
      "lng": 112.6288,
      "description": "Sentra kuliner legendaris dengan aneka jajanan pasar, bakso bakar, dan wedang ronde.",
      "highlights": "Jajanan tradisional, bakso bakar legendaris, wedang jahe",
      "price_range": "Rp 10.000 - Rp 25.000",
      "google_maps_url": "https://www.google.com/maps/search/?api=1&query=-7.9701,112.6288"
    },
    {
      "name": "Museum Angkut & Jatim Park Zone",
      "category": "Wisata Rekreasi & Transportasi",
      "address": "Jl. Terusan Sultan Agung No.2, Ngaglik, Kota Batu",
      "lat": -7.8785,
      "lng": 112.5186,
      "description": "Museum transportasi modern pertama di Asia Tenggara dengan zona tematik dunia.",
      "highlights": "Koleksi mobil klasik dunia, zona Gangster Broadway, pasar apung",
      "price_range": "Tiket Masuk Rp 100.000 - Rp 120.000",
      "google_maps_url": "https://www.google.com/maps/search/?api=1&query=-7.8785,112.5186"
    }
  ],
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
      location: (parsed.locations && Array.isArray(parsed.locations) && parsed.locations.length > 0) ? null : (parsed.location || null),
      locations: parsed.locations && Array.isArray(parsed.locations) ? parsed.locations : null,
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
