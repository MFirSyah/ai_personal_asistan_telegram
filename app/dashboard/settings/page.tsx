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
  const [testingEmail, setTestingEmail] = useState(false);
  const [message, setMessage] = useState('');

  const handleTestEmail = async () => {
    if (!userEmail || !userEmail.includes('@')) {
      setMessage('⚠️ Harap masukkan alamat email yang valid terlebih dahulu!');
      return;
    }
    setTestingEmail(true);
    setMessage('🚀 Sedang memproses pengiriman email tes...');

    try {
      const authHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (userId) authHeaders['x-user-id'] = userId;
      if (telegramId) authHeaders['x-telegram-id'] = telegramId;

      const res = await fetch('/api/data/records', {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({
          userId: userId || undefined,
          telegram_id: telegramId || undefined,
          type: 'test_email',
          data: { email: userEmail },
        }),
      });

      const result = await res.json();
      if (result.ok) {
        setMessage(`✅ Email tes berhasil dikirim ke ${userEmail}! Cek Inbox atau folder Spam.`);
      } else {
        setMessage(`⚠️ Gagal mengirim email tes: ${result.error || 'Terjadi kesalahan'}`);
      }
    } catch (err: any) {
      setMessage(`⚠️ Gagal mengirim email tes: ${err.message || 'Network error'}`);
    } finally {
      setTestingEmail(false);
    }
  };

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

      const authHeaders: Record<string, string> = {};
      if (savedUser) authHeaders['x-user-id'] = savedUser;
      if (savedTg) authHeaders['x-telegram-id'] = savedTg;

      // Fetch latest profile & settings from Supabase DB
      fetch(`/api/data/records?userId=${savedUser}&telegram_id=${savedTg}`, { headers: authHeaders })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) {
            if (data.userId) setUserId(data.userId);
            if (data.userName) setUserName(data.userName);
            if (data.userEmail) setUserEmail(data.userEmail);
            if (data.briefingEnabled !== undefined) setBriefingEnabled(Boolean(data.briefingEnabled));
            if (data.emailBriefingEnabled !== undefined) setEmailBriefingEnabled(Boolean(data.emailBriefingEnabled));
            if (data.briefingTime) setBriefingTime(data.briefingTime);

            if (data.userName) localStorage.setItem('saved_user_name', data.userName);
            if (data.userEmail) localStorage.setItem('saved_user_email', data.userEmail);
          }
        })
        .catch((err) => console.error('Error fetching settings:', err));
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

      const patchHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (userId) patchHeaders['x-user-id'] = userId;
      if (telegramId) patchHeaders['x-telegram-id'] = telegramId;

      // Sync user email & settings to Supabase DB
      const res = await fetch('/api/data/records', {
        method: 'PATCH',
        headers: patchHeaders,
        body: JSON.stringify({
          userId: userId || undefined,
          telegram_id: telegramId || undefined,
          type: 'user_profile',
          data: {
            name: userName,
            email: userEmail,
            email_briefing_enabled: emailBriefingEnabled,
            briefing_enabled: briefingEnabled,
            briefing_time: briefingTime,
          },
        }),
      });

      const result = await res.json();
      if (result.ok) {
        setMessage('✅ Pengaturan & Email berhasil disimpan ke basis data!');
      } else {
        setMessage(`⚠️ Gagal menyimpan ke basis data: ${result.error || 'Kesalahan Server'}`);
      }
    } catch (err: any) {
      setMessage(`⚠️ Gagal menyimpan pengaturan: ${err.message || 'Network Error'}`);
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

          <div className="pt-4 border-t-2 border-black space-y-3">
            <h2 className="font-bold text-base uppercase border-b-2 border-black pb-2 text-black dark:text-white">
              3. Status Sesi & Integrasi
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
