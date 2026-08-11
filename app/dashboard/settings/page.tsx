'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [briefingTime, setBriefingTime] = useState('07:00');
  const [briefingEnabled, setBriefingEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('saved_user_id') || '';
      const savedTg = localStorage.getItem('saved_telegram_id') || '';
      setUserId(savedUser);
      setTelegramId(savedTg);
    }
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      if (userName && userId) {
        localStorage.setItem('saved_user_name', userName);
      }
      setMessage('✅ Pengaturan berhasil disimpan!');
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
        <form onSubmit={handleSaveSettings} className="brutal-card p-6 space-y-4 font-jetbrains text-xs">
          <h2 className="font-bold text-base uppercase border-b-2 border-black pb-2 text-[#008080]">
            1. Profil & Panggilan AI
          </h2>

          <div>
            <label className="block font-bold uppercase mb-1">Nama Panggilan Kamu</label>
            <input
              type="text"
              placeholder="Misal: Firman"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-[#f9f9f9] dark:bg-[#2a2d2d] thin-border p-3 text-xs"
            />
          </div>

          <div className="pt-4 border-t-2 border-black">
            <h2 className="font-bold text-base uppercase border-b-2 border-black pb-2 text-[#536000] mb-3">
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
              <label htmlFor="briefing-toggle" className="font-bold uppercase cursor-pointer">
                Aktifkan Morning Briefing Pagi
              </label>
            </div>

            <div>
              <label className="block font-bold uppercase mb-1">Waktu Pelaksanaan Briefing (WIB)</label>
              <input
                type="time"
                value={briefingTime}
                onChange={(e) => setBriefingTime(e.target.value)}
                className="w-full bg-[#f9f9f9] dark:bg-[#2a2d2d] thin-border p-3 text-xs"
              />
            </div>
          </div>

          <div className="pt-4 border-t-2 border-black space-y-3">
            <h2 className="font-bold text-base uppercase border-b-2 border-black pb-2 text-black dark:text-white">
              3. Status Sesi & Integrasi
            </h2>

            <div className="p-3 bg-[#e2e2e2] dark:bg-white/10 border-2 border-black space-y-1">
              <p><strong>User ID:</strong> {userId || 'Tidak Terhubung'}</p>
              <p><strong>Telegram ID:</strong> {telegramId || 'Tidak Terhubung'}</p>
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
