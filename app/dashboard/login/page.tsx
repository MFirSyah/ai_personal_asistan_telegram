'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Mail, CheckCircle2, Shield, ArrowRight } from 'lucide-react';

function LoginFormContent() {
  const searchParams = useSearchParams();
  const telegramId = searchParams.get('telegram_id');

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const redirectUrl = `${window.location.origin}/dashboard?telegram_id=${telegramId || ''}`;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSent(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengirim magic link');
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
        Masuk ke Dashboard
      </h2>
      <p className="text-xs text-slate-400 text-center mb-6">
        {telegramId
          ? `Menghubungkan akun Telegram ID: ${telegramId}`
          : 'Gunakan email terdaftar untuk mendapatkan Magic Link Login'}
      </p>

      {sent ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-emerald-300">Magic Link Terkirim!</h4>
          <p className="text-xs text-slate-400 mt-1">
            Periksa kotak masuk email <span className="text-slate-200 font-medium">{email}</span> untuk masuk secara otomatis.
          </p>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="space-y-4">
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
            {loading ? 'Mengirim Magic Link...' : 'Kirim Magic Link Login'}
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
