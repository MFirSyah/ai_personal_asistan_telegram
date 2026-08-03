import { generateContentWithFallback } from '../client';

export interface DailyBriefingContext {
  userName?: string;
  insightPayload?: any[];
  yesterdayTransactions?: any[];
  activities?: any[];
  plans?: any[];
  preferences?: any[];
}

export interface DailyBriefingResult {
  messages: string[];
  follow_up_question: string;
}

export async function generateDailyBriefing(
  context: DailyBriefingContext
): Promise<DailyBriefingResult> {
  const prompt = `
Kamu adalah Asisten Keuangan & Aktivitas Personal yang memberikan Morning Briefing harian secara terstruktur, ramah, dan sangat rapi.

KONTEKS USER:
Nama User: ${context.userName || 'Teman'}
Preferensi User: ${JSON.stringify(context.preferences || [])}
Daftar Aktivitas & Catatan: ${JSON.stringify(context.activities || [])}
Daftar Rencana (Plans): ${JSON.stringify(context.plans || [])}
Transaksi Terakhir: ${JSON.stringify(context.yesterdayTransactions || [])}

TUGAS KAMU:
Analisis seluruh agenda, rencana (plans), dan aktivitas pengguna. Susun Morning Briefing menjadi 1-3 pesan bubble (\`messages\`) yang mencakup 6 poin analisis berikut (Gunakan format bullet point dan emoji yang rapi):

1. 🚨 **Yang Perlu Dilakukan Hari Ini**: Agenda/rencana yang jatuh pada hari ini.
2. 📅 **Yang Perlu Disiapkan Untuk Besok (1 Hari Ke Depan)**: Persiapan untuk besok.
3. ⏳ **Yang Perlu Disiapkan Beberapa Hari Ke Depan (< 1 Minggu)**: Persiapan 2-6 hari ke depan (seperti persiapan liburan, sidang, tugas).
4. 🗓️ **Yang Perlu Dilakukan Untuk Plan Seminggu Ke Depan**: Target/rencana 7 hari ke depan.
5. 📌 **Yang Perlu Dilakukan Untuk Plan Sebulan Ke Depan**: Target/rencana bulan ini.
6. ⚠️ **Yang Perlu Dilakukan Urgent / Mendesak**: Hal yang paling mendesak/penting yang membutuhkan perhatian khusus.

Jika pada kategori tertentu belum ada data yang tercatat, berikan keterangan singkat yang ramah (misal: "Belum ada agenda khusus").

FORMAT OUTPUT (WAJIB JSON VALID TANPA MARKDOWN BACKTICKS):
{
  "messages": [
    "Selamat Pagi! ☀️ Berikut Morning Briefing kamu hari ini:",
    "🚨 **Hari Ini**:\n• Sidang Skripsi (Jam 09:00 WIB)\n\n📅 **Persiapan Besok**:\n• Print berkas\n\n⏳ **Beberapa Hari Ke Depan (<1 Minggu)**:\n• Persiapan Liburan ke Dieng\n\n🗓️ **Seminggu Ke Depan**:\n• Evaluasi anggaran mingguan\n\n📌 **Sebulan Ke Depan**:\n• Target tabungan bulan ini\n\n⚠️ **Urgent / Mendesak**:\n• Finalisasi dokumen penting"
  ],
  "follow_up_question": "Ada agenda atau catatan tambahan yang ingin kamu masukkan ke jadwal hari ini?"
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
