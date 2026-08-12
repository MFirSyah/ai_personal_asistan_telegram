'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [emailBriefingEnabled, setEmailBriefingEnabled] = useState(true);
  const [briefingTime, setBriefingTime] = useState('07:00');
  const [briefingEnabled, setBriefingEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('saved_user_id') || '';
      const savedTg = localStorage.getItem('saved_telegram_id') || '';
      const savedName = localStorage.getItem('saved_user_name') || '';
      const savedEmail = localStorage.getItem('saved_user_email') || '';
      setUserId(savedUser);
      setTelegramId(savedTg);
      if (savedName) setUserName(savedName);
      if (savedEmail) setUserEmail(savedEmail);
    }
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      if (typeof window !== 'undefined') {
        if (userName) localStorage.setItem('saved_user_name', userName);
        if (userEmail) localStorage.setItem('saved_user_email', userEmail);
      }

      // Sync user email & settings to Supabase
      if (userId) {
        await fetch('/api/data/records', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            recordId: userId,
            type: 'user_profile',
            data: {
              name: userName,
              email: userEmail,
              email_briefing_enabled: emailBriefingEnabled,
              briefing_enabled: briefingEnabled,
            },
          }),
        }).catch(() => {});
      }

      setMessage('✅ Pengaturan & Email berhasil disimpan!');
    } catch (err) {
      setMessage('⚠️ Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  const handleForceRefreshCache = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/analytics/summary?userId=${userId}&force=true`);
      const data = await res.json();
      if (data.insights) {
        setMessage('⚡ Cache analitik harian berhasil di-refresh!');
      }
    } catch (err) {
      setMessage('⚠️ Gagal me-refresh cache analitik.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-montserrat p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b-4 border-black pb-4">
          <div>
            <h1 className="font-black text-2xl md:text-4xl uppercase tracking-tighter">Pengaturan Account</h1>
            <p className="font-jetbrains text-xs text-black/70 dark:text-white/70 font-bold">Preferences & Assistant Settings</p>
          </div>

          <Link
            href="/dashboard"
            className="bg-[#008080] text-white border-2 border-black px-4 py-2 font-bold font-jetbrains text-xs uppercase hover:bg-black transition-colors"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>

        {message && (
          <div className="p-4 border-2 border-black bg-[#d2f000] text-black font-jetbrains text-xs font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {message}
          </div>
        )}

        {/* Form Settings */}
        <form onSubmit={handleSaveSettings} className="brutal-card p-6 space-y-4 font-jetbrains text-xs bg-white dark:bg-[#1a1c1c] text-black dark:text-white">
          <h2 className="font-bold text-base uppercase border-b-2 border-black pb-2 text-[#008080] dark:text-[#20b2aa]">
            1. Profil & Panggilan AI
          </h2>

          <div>
            <label className="block font-bold uppercase mb-1 text-black dark:text-white">Nama Panggilan Kamu</label>
            <input
              type="text"
              placeholder="Misal: Firman"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-[#f9f9f9] dark:bg-[#2a2d2d] text-black dark:text-white thin-border p-3 text-xs"
            />
          </div>

          <div className="pt-4 border-t-2 border-black">
            <h2 className="font-bold text-base uppercase border-b-2 border-black pb-2 text-[#536000] dark:text-[#d2f000] mb-3">
              2. Jadwal Morning Briefing Harian
            </h2>

            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="briefing-toggle"
                checked={briefingEnabled}
                onChange={(e) => setBriefingEnabled(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="briefing-toggle" className="font-bold uppercase cursor-pointer text-black dark:text-white">
                Aktifkan Morning Briefing Pagi
              </label>
            </div>

            <div>
              <label className="block font-bold uppercase mb-1 text-black dark:text-white">Waktu Pelaksanaan Briefing (WIB)</label>
              <input
                type="time"
                value={briefingTime}
                onChange={(e) => setBriefingTime(e.target.value)}
                className="w-full bg-[#f9f9f9] dark:bg-[#2a2d2d] text-black dark:text-white thin-border p-3 text-xs"
              />
            </div>
          </div>

          {/* Email Settings Section */}
          <div className="pt-4 border-t-2 border-black">
            <h2 className="font-bold text-base uppercase border-b-2 border-black pb-2 text-[#008080] dark:text-[#20b2aa] mb-3">
              3. Pengiriman Email Morning Briefing 📧
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block font-bold uppercase mb-1 text-black dark:text-white">Alamat Email Penerima</label>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-[#f9f9f9] dark:bg-[#2a2d2d] text-black dark:text-white thin-border p-3 text-xs"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="email-briefing-toggle"
                  checked={emailBriefingEnabled}
                  onChange={(e) => setEmailBriefingEnabled(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="email-briefing-toggle" className="font-bold uppercase cursor-pointer text-black dark:text-white">
                  Kirimkan Morning Briefing juga via Email setiap pagi
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t-2 border-black space-y-3">
            <h2 className="font-bold text-base uppercase border-b-2 border-black pb-2 text-black dark:text-white">
              4. Status Sesi & Integrasi
            </h2>

            <div className="p-3 bg-[#e2e2e2] dark:bg-white/10 border-2 border-black space-y-1 text-black dark:text-white">
              <p><strong>User ID:</strong> {userId || 'Tidak Terhubung'}</p>
              <p><strong>Telegram ID:</strong> {telegramId || 'Tidak Terhubung'}</p>
              <p><strong>Email Registered:</strong> {userEmail || 'Belum Diatur'}</p>
            </div>

            <button
              type="button"
              onClick={handleForceRefreshCache}
              disabled={saving}
              className="w-full bg-[#536000] text-white brutalist-border p-3 font-bold uppercase text-xs hover:bg-black transition-colors disabled:opacity-50 cursor-pointer"
            >
              ⚡ Force Refresh Cache Analitik Harian
            </button>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#008080] text-white brutalist-border p-3 font-bold uppercase text-sm hover:bg-black transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Memproses...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
