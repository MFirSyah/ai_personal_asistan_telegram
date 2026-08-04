'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const telegramId = searchParams.get('telegram_id');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Sign in with Email and Password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.user) {
        // Link Telegram ID if provided
        if (telegramId) {
          try {
            await fetch('/api/auth/link-telegram', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: data.user.email,
                telegramId,
                name: data.user.email?.split('@')[0],
              }),
            });
          } catch (err) {
            console.error('Failed linking telegram account:', err);
          }
        }

        setSuccessMessage('Login berhasil! Mengalihkan ke dashboard...');
        setTimeout(() => {
          window.location.href = `/dashboard${telegramId ? `?telegram_id=${telegramId}` : ''}`;
        }, 1000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal melakukan login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md brutal-card p-8">
      <div className="flex items-center justify-center w-14 h-14 bg-[#008080] brutalist-border mb-6 mx-auto">
        <span className="material-symbols-outlined text-3xl text-white">shield</span>
      </div>

      <h2 className="font-black text-2xl uppercase tracking-tighter text-center mb-2">
        Masuk Akun Asisten
      </h2>
      <p className="font-jetbrains text-xs text-center mb-6 bg-black text-white px-3 py-1 inline-block mx-auto w-full text-center">
        {telegramId
          ? `MENGHUBUNGKAN TELEGRAM ID: ${telegramId}`
          : 'MASUKKAN EMAIL DAN KATA SANDI AKUN TERDAFTAR'}
      </p>

      {successMessage ? (
        <div className="bg-[#d2f000] border-4 border-black p-4 text-center brutalist-shadow">
          <span className="material-symbols-outlined text-3xl text-[#008080] mb-2">check_circle</span>
          <h4 className="font-bold text-sm uppercase">{successMessage}</h4>
        </div>
      ) : (
        <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
          <div>
            <label className="block font-jetbrains text-xs font-bold uppercase mb-1">Alamat Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm">mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full pl-10 pr-4 py-3 bg-[#f9f9f9] thin-border font-jetbrains text-sm focus:outline-none focus:border-[#008080] focus:shadow-[4px_4px_0px_0px_#008080] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block font-jetbrains text-xs font-bold uppercase mb-1">Kata Sandi (Password)</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm">lock</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 bg-[#f9f9f9] thin-border font-jetbrains text-sm focus:outline-none focus:border-[#008080] focus:shadow-[4px_4px_0px_0px_#008080] transition-all"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="bg-[#ffdad6] border-2 border-[#ba1a1a] p-3 text-[#93000a] font-jetbrains text-xs font-bold">
              ⚠️ {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#008080] text-white brutalist-border brutalist-shadow p-3 font-bold uppercase text-sm brutalist-hover brutalist-active disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Memverifikasi Akun...' : 'Masuk (Login)'}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f9f9f9] text-[#1a1c1c] font-montserrat">
      <Suspense fallback={<div className="font-jetbrains font-bold uppercase">MEMUAT FORM LOGIN...</div>}>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
