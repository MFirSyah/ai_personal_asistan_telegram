import React from 'react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-[#0B0C10] text-white p-8 font-sans">
      <header className="mb-8 flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-purple-400">
            Super Admin Control Center 👑
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Portal Manajemen & Manipulasi Data Terpusat • System Health & AI Monitor
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-sm font-semibold transition">
            ← Kembali ke User Dashboard
          </Link>
        </div>
      </header>

      {/* Grid Menu Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/users" className="block p-6 bg-[#1F2833] rounded-xl border border-gray-800 hover:border-purple-500 transition group">
          <div className="text-3xl mb-3">👥</div>
          <h2 className="text-xl font-bold text-white group-hover:text-purple-400 transition">User & Account Manager</h2>
          <p className="text-gray-400 text-xs mt-2">
            Kelola profil pengguna terdaftar (Mas Firman & Mbak Khofita), relasi Telegram ID, dan status autentikasi.
          </p>
        </Link>

        <Link href="/admin/data-inspector" className="block p-6 bg-[#1F2833] rounded-xl border border-gray-800 hover:border-cyan-500 transition group">
          <div className="text-3xl mb-3">🗄️</div>
          <h2 className="text-xl font-bold text-white group-hover:text-cyan-400 transition">Multi-Tenant Data Inspector</h2>
          <p className="text-gray-400 text-xs mt-2">
            Fitur CRUD penuh untuk menginspeksi, memulihkan data soft-delete, atau merekonstruksi transaksi & agenda.
          </p>
        </Link>

        <Link href="/admin/push-dispatcher" className="block p-6 bg-[#1F2833] rounded-xl border border-gray-800 hover:border-emerald-500 transition group">
          <div className="text-3xl mb-3">🔔</div>
          <h2 className="text-xl font-bold text-white group-hover:text-emerald-400 transition">Push Notification Broadcast</h2>
          <p className="text-gray-400 text-xs mt-2">
            Kirimkan siaran pengumuman manual atau pengingat darurat langsung sebagai notifikasi pop-up di HP.
          </p>
        </Link>
      </div>

      {/* System Health & Gemini Token Consumption Monitor */}
      <div className="bg-[#1F2833] rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-bold mb-4 text-purple-300">📊 System Health & Gemini Rate Limit Monitor</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#0B0C10] p-4 rounded-lg border border-gray-800">
            <span className="text-xs text-gray-400 font-bold block">SUPABASE LIVE DB</span>
            <span className="text-emerald-400 font-bold text-lg mt-1 block">🟢 100% Connected</span>
          </div>
          <div className="bg-[#0B0C10] p-4 rounded-lg border border-gray-800">
            <span className="text-xs text-gray-400 font-bold block">GEMINI 3.5 FLASH LITE</span>
            <span className="text-cyan-400 font-bold text-lg mt-1 block">0 / 500 RPD</span>
          </div>
          <div className="bg-[#0B0C10] p-4 rounded-lg border border-gray-800">
            <span className="text-xs text-gray-400 font-bold block">GEMINI 3.6 FLASH</span>
            <span className="text-purple-400 font-bold text-lg mt-1 block">0 / 20 RPD</span>
          </div>
          <div className="bg-[#0B0C10] p-4 rounded-lg border border-gray-800">
            <span className="text-xs text-gray-400 font-bold block">GEMMA 4 BATCH ENGINE</span>
            <span className="text-amber-400 font-bold text-lg mt-1 block">0 / 14.400 RPD</span>
          </div>
        </div>
      </div>
    </div>
  );
}
