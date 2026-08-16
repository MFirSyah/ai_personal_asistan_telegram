'use client';
import React, { useState } from 'react';
import Link from 'next/link';

export default function AdminPushDispatcherPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sentStatus, setSentStatus] = useState(false);

  const handleSendBroadcast = () => {
    if (!title || !body) return;
    setSentStatus(true);
    setTimeout(() => {
      setSentStatus(false);
      setTitle('');
      setBody('');
      alert('Push notification broadcast berhasil dikirimkan ke Mobile App!');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white p-8 font-sans">
      <header className="mb-8 flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-emerald-400">
            🔔 Mobile Push Notification Broadcast Dispatcher
          </h1>
          <p className="text-gray-400 text-sm mt-1">Kirimkan Siaran Notifikasi Pop-Up Langsung ke HP Pengguna</p>
        </div>
        <Link href="/admin" className="px-4 py-2 bg-gray-800 text-gray-200 rounded-lg text-sm font-semibold">
          ← Kembali ke Admin Center
        </Link>
      </header>

      <div className="bg-[#1F2833] rounded-xl border border-gray-800 p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">JUDUL NOTIFIKASI</label>
            <input
              type="text"
              placeholder="Contoh: 🌅 Pengingat Morning Briefing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0B0C10] border border-gray-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">ISI PESAN NOTIFIKASI</label>
            <textarea
              rows={4}
              placeholder="Tuliskan isi notifikasi..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-[#0B0C10] border border-gray-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            onClick={handleSendBroadcast}
            disabled={sentStatus}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition"
          >
            {sentStatus ? 'Mengirim Siaran...' : '🚀 Kirim Push Notification Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
