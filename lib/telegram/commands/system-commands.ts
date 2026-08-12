import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { sendTelegramMessage } from '@/lib/telegram/send-message';
import { buildConfirmationInlineKeyboard } from '@/lib/telegram/inline-keyboard';
import { updateUserName } from '@/lib/supabase/queries/sessions';
import { getUserPreferences, saveUserPreference } from '@/lib/supabase/queries/preferences';
import { randomizeTransactionTimestamps, randomizeActivityTimestamps } from '@/lib/supabase/queries/transactions';

export async function handleSystemCommands(
  text: string,
  chatId: number | string,
  user: { id: string; name: string | null }
): Promise<NextResponse | null> {
  // /acak_jam & /update_tanggal
  if (text.startsWith('/acak_jam') || text.startsWith('/update_tanggal')) {
    const parts = text.split(' ').filter(Boolean);
    const startHr = parts[1] && !isNaN(parseInt(parts[1], 10)) ? parseInt(parts[1], 10) : 8;
    const endHr = parts[2] && !isNaN(parseInt(parts[2], 10)) ? parseInt(parts[2], 10) : 21;
    const targetDate = new Date().toISOString().split('T')[0];

    const [txCount, actCount] = await Promise.all([
      randomizeTransactionTimestamps(user.id, targetDate, startHr, endHr),
      randomizeActivityTimestamps(user.id, targetDate, startHr, endHr),
    ]);

    await sendTelegramMessage(
      chatId,
      `⏰ **BERHASIL MENGACAK TANGGAL & JAM!**\n\n• **Tanggal Target**: ${targetDate} (Hari Ini)\n• **Rentang Jam**: ${String(startHr).padStart(2, '0')}:00 - ${String(endHr).padStart(2, '0')}:00 WIB\n• **Total Transaksi Diperbarui**: ${txCount}\n• **Total Aktivitas Diperbarui**: ${actCount}`
    );
    return NextResponse.json({ ok: true });
  }

  // /preferensi
  if (text.startsWith('/preferensi')) {
    const prefs = await getUserPreferences(user.id);
    if (prefs.length === 0) {
      await sendTelegramMessage(chatId, 'ℹ️ Belum ada preferensi personal yang dipelajari AI dari percakapan kamu.');
      return NextResponse.json({ ok: true });
    }

    let prefMsg = `⚙️ **PREFERENSI & POLA YANG DIPELAJARI AI**\n\n`;
    for (let idx = 0; idx < prefs.length; idx++) {
      const p = prefs[idx];
      const cleanKey = String(p.key || '').replace(/[*_`]/g, '').trim();
      const cleanVal = String(p.value || '').replace(/[*_`]/g, '').trim();
      const cleanLearned = p.learned_from ? String(p.learned_from).replace(/[*_`]/g, '').trim() : undefined;

      if (cleanKey !== p.key || cleanVal !== p.value) {
        saveUserPreference(user.id, cleanKey, cleanVal, cleanLearned).catch(console.error);
      }

      prefMsg += `${idx + 1}. **${cleanKey}**: ${cleanVal}\n`;
      if (cleanLearned) {
        prefMsg += `   _(Konteks: ${cleanLearned})_\n`;
      }
    }

    await sendTelegramMessage(chatId, prefMsg);
    return NextResponse.json({ ok: true });
  }

  // /nama
  if (text.startsWith('/nama')) {
    const newName = text.replace('/nama', '').trim();
    if (!newName) {
      const currentName = user.name || 'Belum diatur';
      await sendTelegramMessage(
        chatId,
        `👤 **PENGATURAN NAMA PANGGILAN AI**\n\nNama kamu yang terdaftar saat ini: **${currentName}**\n\nUntuk mengubah nama panggilannya, ketik:\n\`/nama NamaKamu\` *(contoh: \`/nama Firman\` atau \`/nama Mas Firman\`)*`
      );
      return NextResponse.json({ ok: true });
    }

    await updateUserName(user.id, newName);
    await saveUserPreference(user.id, 'nama_panggilan', newName, 'Pengaturan Perintah /nama');

    await sendTelegramMessage(
      chatId,
      `✅ **Nama Panggilan Berhasil Diubah!**\nMulai sekarang AI akan selalu memanggil kamu dengan nama: **${newName}**.`
    );
    return NextResponse.json({ ok: true });
  }

  // /briefing
  if (text.startsWith('/briefing')) {
    const args = text.replace('/briefing', '').trim();

    if (args) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(args)) {
        await sendTelegramMessage(chatId, '⚠️ Format jam salah. Gunakan format HH:MM (contoh: `/briefing 07:00`).');
        return NextResponse.json({ ok: true });
      }

      await supabaseAdmin.from('user_settings').upsert({
        user_id: user.id,
        briefing_enabled: true,
        briefing_time: `${args}:00`,
        timezone: 'Asia/Jakarta',
        updated_at: new Date().toISOString(),
      });

      await sendTelegramMessage(chatId, `✅ **Morning Briefing Diatur!**\nKamu akan menerima ringkasan pagi setiap hari jam **${args} WIB**.`);
      return NextResponse.json({ ok: true });
    }

    const { data: settings } = await supabaseAdmin
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const isEnabled = settings?.briefing_enabled ? 'Aktif ✅' : 'Non-Aktif ❌';
    const bTime = settings?.briefing_time ? settings.briefing_time.substring(0, 5) : 'Belum diatur';

    let briefingMsg = `⏰ **PENGATURAN MORNING BRIEFING**\n\n`;
    briefingMsg += `Status: ${isEnabled}\n`;
    briefingMsg += `Jam Kirim: ${bTime} WIB\n\n`;
    briefingMsg += `Untuk mengaktifkan/mengubah jam, ketik:\n\`/briefing 07:00\` *(isi dengan jam yang diinginkan)*`;

    await sendTelegramMessage(chatId, briefingMsg);
    return NextResponse.json({ ok: true });
  }

  // /bantuan
  if (text.startsWith('/bantuan')) {
    let helpMsg = `📖 **PANDUAN PENGGUNAAN BOT ASISTEN** 📖\n\n`;
    helpMsg += `1️⃣ **Catat Keuangan**: Kirim pesan biasa (contoh: *"beli makan siang 25rb"* atau *"terima gaji 5jt"*).\n`;
    helpMsg += `2️⃣ **Scan Struk**: Cukup kirim foto struk belanja kamu, AI akan membaca total & daftar barang otomatis!\n`;
    helpMsg += `3️⃣ **Agenda & Aktivitas**: Kirim jadwal (contoh: *"ingatkan sidang skripsi besok jam 10 pagi"*).\n`;
    helpMsg += `4️⃣ **Tanya Jawab AI**: Bebas bertukar pikiran atau tanya saran keuangan (*"gimana cara hemat bulan ini?"*).\n\n`;
    helpMsg += `Daftar Perintah Ringkas:\n`;
    helpMsg += `- /ringkasan : Rekap cepat keuangan\n`;
    helpMsg += `- /dashboard : Mini App interaktif\n`;
    helpMsg += `- /nama : Lihat & ubah nama panggilan AI\n`;
    helpMsg += `- /progress : Cek proses hapus/job\n`;
    helpMsg += `- /preferensi : Pola yang dipelajari AI\n`;
    helpMsg += `- /briefing : Atur pengingat pagi\n`;
    helpMsg += `- /hapus_semua : Hapus data kamu`;

    await sendTelegramMessage(chatId, helpMsg);
    return NextResponse.json({ ok: true });
  }

  // /hapus_semua
  if (text.startsWith('/hapus_semua')) {
    await sendTelegramMessage(
      chatId,
      '⚠️ **KONFIRMASI PENGHAPUSAN DATA**\n\nApakah kamu yakin ingin menghapus semua catatan pengeluaran dan aktivitas kamu?\n\n*(Data yang dihapus akan dipindahkan ke tempat sampah dan dapat dipulihkan oleh admin jika diperlukan)*',
      buildConfirmationInlineKeyboard('confirm_delete_all', 'cancel')
    );
    return NextResponse.json({ ok: true });
  }

  return null;
}
