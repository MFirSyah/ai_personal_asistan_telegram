import React from 'react';
import Link from 'next/link';

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen bg-[#0B0C10] text-white p-8 font-sans">
      <header className="mb-8 flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-purple-400">
            👥 User & Household Account Manager
          </h1>
          <p className="text-gray-400 text-sm mt-1">Daftar Pengguna Pasangan Terdaftar di Database Supabase</p>
        </div>
        <Link href="/admin" className="px-4 py-2 bg-gray-800 text-gray-200 rounded-lg text-sm font-semibold">
          ← Kembali ke Admin Center
        </Link>
      </header>

      <div className="bg-[#1F2833] rounded-xl border border-gray-800 p-6">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-xs">
              <th className="pb-3">PROFIL PENGGUNA</th>
              <th className="pb-3">ROLE / PERAN</th>
              <th className="pb-3">TELEGRAM ID</th>
              <th className="pb-3">STATUS SESI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            <tr>
              <td className="py-4 font-bold text-white">Mas Firman</td>
              <td className="py-4 text-purple-400 font-semibold">Executive Owner</td>
              <td className="py-4 text-gray-300">@MFirSyah (Active)</td>
              <td className="py-4 text-emerald-400 font-bold">🟢 Active Session</td>
            </tr>
            <tr>
              <td className="py-4 font-bold text-white">Mbak Khofita</td>
              <td className="py-4 text-cyan-400 font-semibold">Partner / Joint Account</td>
              <td className="py-4 text-gray-300">Connected via Joint Bot</td>
              <td className="py-4 text-emerald-400 font-bold">🟢 Active Session</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
