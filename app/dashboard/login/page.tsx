'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Mail, Lock, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
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
    <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-slate-800 shadow-2xl">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-6 mx-auto">
        <Shield className="w-6 h-6" />
      </div>

      <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
        Masuk Akun Asisten
      </h2>
      <p className="text-xs text-slate-400 text-center mb-6">
        {telegramId
          ? `Menghubungkan akun Telegram ID: ${telegramId}`
          : 'Masukkan email dan kata sandi akun terdaftar Anda'}
      </p>

      {successMessage ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-emerald-300">{successMessage}</h4>
        </div>
      ) : (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Alamat Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Kata Sandi (Password)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {errorMessage && (
            <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            {loading ? 'Memverifikasi Akun...' : 'Masuk (Login)'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
      <Suspense fallback={<div className="text-slate-400 text-sm">Memuat form login...</div>}>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
