'use client';

import React from 'react';

const HTML_SOURCE = `<!DOCTYPE html>
<html class="dark" lang="id">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport"/>
  <title>DATA_CORE_V1 - Mobile AI Assistant</title>
  <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  <script>
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            background: "#0B0F12",
            surface: "#141A20",
            "surface-elevated": "#1C242C",
            "surface-high": "#262A2E",
            border: "#28323E",
            primary: "#00A8A8",
            "primary-dark": "#008080",
            "primary-container": "#004F4F",
            lime: "#D2F000",
            "lime-dark": "#4D7C0F",
            tosca: "#00B4D8",
            "tosca-dark": "#0077B6",
            emerald: "#10B981",
            amber: "#F59E0B",
            coral: "#EF4444",
            "text-primary": "#F8FAFC",
            "text-secondary": "#94A3B8"
          },
          fontFamily: {
            headline: ["Montserrat", "sans-serif"],
            body: ["Inter", "sans-serif"],
            mono: ["JetBrains Mono", "monospace"]
          }
        }
      }
    };
  </script>
  <style>
    body {
      background-color: #0B0F12;
      color: #F8FAFC;
      font-family: 'Inter', sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .light body {
      background-color: #F8FAFC;
      color: #0F172A;
    }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .glass-panel {
      background: rgba(20, 26, 32, 0.75);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(40, 50, 62, 0.6);
    }
    .light .glass-panel {
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid rgba(203, 213, 225, 0.8);
    }
    .tosca-bloom { box-shadow: 0 0 16px rgba(0, 168, 168, 0.35); }
    .lime-glow { box-shadow: 0 0 16px rgba(210, 240, 0, 0.4); }
    .tab-content { display: none; }
    .tab-content.active { display: flex; flex-direction: column; animation: fadeIn 0.25s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body class="flex flex-col h-screen overflow-hidden text-sm">

  <!-- ========================================================================= -->
  <!-- 🔝 TOP APP BAR (EXECUTIVE HEADER) -->
  <!-- ========================================================================= -->
  <header class="glass-panel sticky top-0 z-40 px-4 py-3 flex justify-between items-center border-b border-border/40">
    <div class="flex items-center gap-3">
      <div class="relative">
        <div class="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center border border-primary/40 tosca-bloom">
          <span class="material-symbols-outlined text-primary text-[20px]">smart_toy</span>
        </div>
        <div class="absolute bottom-0 right-0 w-3 h-3 bg-lime rounded-full border-2 border-background animate-pulse"></div>
      </div>
      <div>
        <h1 class="font-headline font-bold text-base leading-tight flex items-center gap-1.5 text-text-primary">
          DATA_CORE_V1
          <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">PRO</span>
        </h1>
        <p class="text-[11px] font-mono text-lime flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-lime inline-block animate-ping"></span> ONLINE • MAS FIRMAN
        </p>
      </div>
    </div>

    <!-- Quick Balance Pill -->
    <div class="glass-panel px-3 py-1.5 rounded-full flex items-center gap-2 border border-border/60">
      <div class="flex items-center gap-1">
        <span class="text-[10px] font-mono text-text-secondary uppercase">Kas</span>
        <span class="text-xs font-mono font-bold text-lime" id="header-cash">Rp 455k</span>
      </div>
      <span class="w-px h-3 bg-border"></span>
      <div class="flex items-center gap-1">
        <span class="text-[10px] font-mono text-text-secondary uppercase">Gopay</span>
        <span class="text-xs font-mono font-bold text-tosca" id="header-gopay">Rp 164k</span>
      </div>
    </div>
  </header>

  <!-- ========================================================================= -->
  <!-- 📱 MAIN VIEW CANVAS (CONTAINER FOR 5 TABS) -->
  <!-- ========================================================================= -->
  <main class="flex-1 overflow-y-auto hide-scrollbar pb-24 relative">

    <!-- ======================================================================= -->
    <!-- 📊 TAB 1: ANALYTICS & SMART INSIGHTS -->
    <!-- ======================================================================= -->
    <section id="tab-analytics" class="tab-content px-4 py-4 space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="font-headline font-bold text-xl text-text-primary">Analisis Keuangan & Aktivitas</h2>
        <div class="flex gap-1 bg-surface-elevated p-1 rounded-full border border-border">
          <button class="px-2.5 py-1 rounded-full text-[11px] font-mono bg-primary text-black font-bold">Bulan Ini</button>
          <button class="px-2.5 py-1 rounded-full text-[11px] font-mono text-text-secondary">7 Hari</button>
        </div>
      </div>

      <!-- Health Score Card -->
      <div class="bg-surface rounded-2xl p-5 border border-border relative overflow-hidden tosca-bloom">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">Financial Health Score</span>
            <h3 class="text-2xl font-mono font-black text-text-primary mt-0.5">88<span class="text-xs text-text-secondary">/100</span></h3>
            <p class="text-xs text-text-secondary mt-1 max-w-[200px]">Kondisi Keuangan Sangat Sehat & Beban Cicilan Terkendali.</p>
          </div>
          <div class="w-16 h-16 rounded-full bg-surface-elevated border-4 border-primary flex items-center justify-center font-mono font-bold text-lime text-lg">
            A+
          </div>
        </div>
      </div>

      <!-- 2x2 Metric Grid -->
      <div class="grid grid-cols-2 gap-3 font-mono">
        <div class="bg-surface rounded-xl p-3.5 border border-border">
          <span class="text-[10px] text-text-secondary uppercase">Total Pemasukan</span>
          <p class="text-base font-bold text-emerald mt-1" id="stat-income">Rp 3.450.000</p>
          <span class="text-[10px] text-emerald">▲ +12% vs lalu</span>
        </div>
        <div class="bg-surface rounded-xl p-3.5 border border-border">
          <span class="text-[10px] text-text-secondary uppercase">Total Pengeluaran</span>
          <p class="text-base font-bold text-coral mt-1" id="stat-expense">Rp 2.120.000</p>
          <span class="text-[10px] text-coral">▼ -5% vs lalu</span>
        </div>
        <div class="bg-surface rounded-xl p-3.5 border border-border">
          <span class="text-[10px] text-text-secondary uppercase">Sisa Kas Likuid</span>
          <p class="text-base font-bold text-tosca mt-1" id="stat-balance">Rp 1.330.000</p>
          <span class="text-[10px] text-text-secondary">Aman & Terjaga</span>
        </div>
        <div class="bg-surface rounded-xl p-3.5 border border-border">
          <span class="text-[10px] text-text-secondary uppercase">Daily Burn Rate</span>
          <p class="text-base font-bold text-lime mt-1" id="stat-burn">Rp 68.000<span class="text-[10px] text-text-secondary">/hr</span></p>
          <span class="text-[10px] text-lime">Stabil Normal</span>
        </div>
      </div>

      <!-- Category Breakdown Mini Card -->
      <div class="bg-surface rounded-xl p-4 border border-border space-y-2.5">
        <h4 class="font-headline font-bold text-xs uppercase text-text-secondary tracking-wider">Distribusi Pengeluaran Teratas</h4>
        <div class="space-y-2 font-mono text-xs">
          <div>
            <div class="flex justify-between text-[11px] mb-1">
              <span>🍔 Makanan & Minuman</span>
              <span class="text-text-primary font-bold">Rp 850.000 (40%)</span>
            </div>
            <div class="w-full h-2 bg-surface-elevated rounded-full overflow-hidden">
              <div class="h-full bg-primary rounded-full" style="width: 40%"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-[11px] mb-1">
              <span>⛽ Bensin Beat & Ojek</span>
              <span class="text-text-primary font-bold">Rp 420.000 (20%)</span>
            </div>
            <div class="w-full h-2 bg-surface-elevated rounded-full overflow-hidden">
              <div class="h-full bg-lime rounded-full" style="width: 20%"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-[11px] mb-1">
              <span>💳 Cicilan Bank Jago</span>
              <span class="text-text-primary font-bold">Rp 67.940 (10%)</span>
            </div>
            <div class="w-full h-2 bg-surface-elevated rounded-full overflow-hidden">
              <div class="h-full bg-amber rounded-full" style="width: 10%"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================================= -->
    <!-- 🗄️ TAB 2: DATA CORE & GANTT TIMELINE -->
    <!-- ======================================================================= -->
    <section id="tab-data" class="tab-content px-4 py-4 space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="font-headline font-bold text-xl text-text-primary">Data Core & Timeline</h2>
        <button onclick="exportToExcel()" class="px-3 py-1.5 bg-primary/20 border border-primary text-primary text-xs font-mono font-bold rounded-lg flex items-center gap-1 hover:bg-primary hover:text-black transition-all">
          <span class="material-symbols-outlined text-[14px]">bolt</span> Export Excel
        </button>
      </div>

      <!-- Segmented Switcher -->
      <div class="flex bg-surface-elevated p-1 rounded-xl border border-border">
        <button id="sub-btn-gantt" onclick="switchDataSubView('gantt')" class="flex-1 py-2 rounded-lg text-xs font-mono font-bold bg-primary text-black transition-all">
          📅 Agenda & Gantt Chart
        </button>
        <button id="sub-btn-ledger" onclick="switchDataSubView('ledger')" class="flex-1 py-2 rounded-lg text-xs font-mono font-bold text-text-secondary hover:text-text-primary transition-all">
          💳 Transaksi Keuangan
        </button>
      </div>

      <!-- Gantt Sub-view -->
      <div id="sub-view-gantt" class="space-y-3">
        <div class="bg-surface rounded-2xl p-4 border border-border space-y-3">
          <div class="flex justify-between items-center text-xs font-mono text-text-secondary border-b border-border/50 pb-2">
            <span class="font-bold text-text-primary">AGENDA & TARGET 2026</span>
            <span class="text-lime">HARI INI: 27 AGUSTUS</span>
          </div>

          <!-- Gantt Item 1 -->
          <div class="p-3 bg-surface-elevated rounded-xl border border-border space-y-1.5">
            <div class="flex justify-between items-center">
              <span class="font-bold text-text-primary text-xs flex items-center gap-1.5">
                <span class="material-symbols-outlined text-tosca text-[16px]">landscape</span> Trip ke Dieng (29-30 Ags)
              </span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-tosca/20 text-tosca border border-tosca/30 font-bold">50% PREP</span>
            </div>
            <div class="w-full h-2.5 bg-surface rounded-full overflow-hidden border border-border/40">
              <div class="h-full bg-tosca rounded-full" style="width: 50%"></div>
            </div>
            <div class="flex justify-between text-[10px] font-mono text-text-secondary">
              <span>🗓️ 29 s/d 30 Agustus (2 hari)</span>
              <span>Sisa Pagu: Rp 740.000</span>
            </div>
          </div>

          <!-- Gantt Item 2 -->
          <div class="p-3 bg-surface-elevated rounded-xl border border-border space-y-1.5">
            <div class="flex justify-between items-center">
              <span class="font-bold text-text-primary text-xs flex items-center gap-1.5">
                <span class="material-symbols-outlined text-amber text-[16px]">two_wheeler</span> Narik Gojek Rutin
              </span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber/20 text-amber border border-amber/30 font-bold">TERJADWAL</span>
            </div>
            <div class="w-full h-2.5 bg-surface rounded-full overflow-hidden border border-border/40">
              <div class="h-full bg-amber rounded-full" style="width: 30%"></div>
            </div>
            <div class="flex justify-between text-[10px] font-mono text-text-secondary">
              <span>🗓️ Harian Kota Malang</span>
              <span>Target: Rp 150.000 / hari</span>
            </div>
          </div>

          <!-- Gantt Item 3 -->
          <div class="p-3 bg-surface-elevated rounded-xl border border-border space-y-1.5">
            <div class="flex justify-between items-center">
              <span class="font-bold text-text-primary text-xs flex items-center gap-1.5">
                <span class="material-symbols-outlined text-emerald text-[16px]">school</span> Wisuda Telkom University
              </span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald/20 text-emerald border border-emerald/30 font-bold">SELESAI (100%)</span>
            </div>
            <div class="w-full h-2.5 bg-surface rounded-full overflow-hidden border border-border/40">
              <div class="h-full bg-emerald rounded-full" style="width: 100%"></div>
            </div>
            <div class="flex justify-between text-[10px] font-mono text-text-secondary">
              <span>🗓️ 12 Agustus 2026</span>
              <span>Status: Sukses Selesai</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Ledger Sub-view -->
      <div id="sub-view-ledger" class="space-y-3" style="display: none;">
        <div class="flex gap-2 overflow-x-auto hide-scrollbar text-xs font-mono">
          <button class="px-3 py-1 bg-primary text-black font-bold rounded-full">Semua</button>
          <button class="px-3 py-1 bg-surface-elevated text-text-secondary rounded-full border border-border">Cash Kertas</button>
          <button class="px-3 py-1 bg-surface-elevated text-text-secondary rounded-full border border-border">Gopay</button>
          <button class="px-3 py-1 bg-surface-elevated text-text-secondary rounded-full border border-border">Bank Jago</button>
        </div>

        <div id="ledger-list-container" class="space-y-2">
          <!-- Live items will load here -->
        </div>
      </div>
    </section>

    <!-- ======================================================================= -->
    <!-- 💬 TAB 3: AI BUTLER CHAT HUB (CENTER HERO / DEFAULT LANDING SCREEN) -->
    <!-- ======================================================================= -->
    <section id="tab-chat" class="tab-content active px-4 py-4 flex flex-col min-h-full">
      
      <!-- Timestamp Badge -->
      <div class="text-center my-2">
        <span class="text-[10px] font-mono text-text-secondary bg-surface-elevated px-3 py-1 rounded-full border border-border/50">
          HARI INI, 27 AGUSTUS 2026
        </span>
      </div>

      <!-- Message Stream Container -->
      <div id="chat-messages-container" class="space-y-4 mb-24">
        
        <!-- Welcome Butler Message -->
        <div class="flex items-start gap-2.5">
          <div class="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center border border-primary/40 text-primary shrink-0 mt-1">
            <span class="material-symbols-outlined text-[18px]">smart_toy</span>
          </div>
          <div class="bg-surface rounded-2xl rounded-tl-sm p-4 max-w-[90%] border border-border shadow-lg space-y-3">
            <p class="text-text-primary leading-relaxed">
              Selamat datang, <b>Mas Firman</b>. Asisten AI Butler siap membantu pencatatan keuangan, rincian anggaran, analisis performa Gojek, dan timeline agenda Anda.
            </p>

            <!-- Dieng Progress Card Widget -->
            <div class="bg-background rounded-xl p-3 border-l-4 border-primary space-y-2 font-mono">
              <div class="flex justify-between items-center">
                <span class="font-bold text-primary flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">landscape</span> Plan Trip Dieng
                </span>
                <span class="text-[10px] text-lime">29-30 Ags</span>
              </div>
              <div class="grid grid-cols-2 gap-1 text-xs">
                <span class="text-text-secondary">Pagu Anggaran:</span>
                <span class="text-right text-text-primary">Rp 1.040.000</span>
                <span class="text-text-secondary">Cicilan Masuk (3x):</span>
                <span class="text-right text-lime font-bold">Rp 300.000</span>
                <span class="text-text-secondary">Sisa Kekurangan:</span>
                <span class="text-right text-tosca font-bold">Rp 740.000</span>
              </div>
            </div>

            <!-- Honda Beat Fuel Widget -->
            <div class="bg-background rounded-xl p-3 border border-border flex items-center gap-3">
              <div class="p-2 rounded-lg bg-surface-elevated text-lime">
                <span class="material-symbols-outlined text-[20px]">local_gas_station</span>
              </div>
              <div class="font-mono text-xs">
                <p class="font-bold text-text-primary">Honda Beat FI (BBM Pertalite)</p>
                <p class="text-[11px] text-text-secondary">Konsumsi: ~50 KM/L • Biaya: ~Rp 200/KM</p>
              </div>
            </div>

            <p class="text-[11px] text-text-secondary font-mono">
              💡 Ada yang ingin Mas Firman tanyakan atau catat sekarang?
            </p>
          </div>
        </div>

      </div>

    </section>

    <!-- ======================================================================= -->
    <!-- 🔔 TAB 4: NOTIFICATIONS & SMART ALERTS -->
    <!-- ======================================================================= -->
    <section id="tab-notifications" class="tab-content px-4 py-4 space-y-3">
      <h2 class="font-headline font-bold text-xl text-text-primary">Pusat Notifikasi & Pengingat</h2>

      <!-- Urgent Card: Bank Jago -->
      <div class="bg-surface rounded-2xl p-4 border-l-4 border-coral border border-border space-y-1.5 shadow-lg">
        <div class="flex justify-between items-center">
          <span class="text-xs font-mono font-bold text-coral flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">warning</span> CICILAN PINJAMAN BANK JAGO
          </span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-coral/20 text-coral font-bold">JATUH TEMPO</span>
        </div>
        <p class="text-lg font-mono font-bold text-text-primary">Rp 67.940 <span class="text-xs text-text-secondary font-normal">/ bulan</span></p>
        <p class="text-xs text-text-secondary">Autodebet setiap tanggal 20. Sisa tenor 11 bulan (Pokok Rp 50.000 + Bunga Rp 17.940).</p>
      </div>

      <!-- Debt Card: Rifky -->
      <div class="bg-surface rounded-2xl p-4 border-l-4 border-amber border border-border space-y-1.5">
        <div class="flex justify-between items-center">
          <span class="text-xs font-mono font-bold text-amber flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">handshake</span> HUTANG KE RIFKY
          </span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber/20 text-amber font-bold">TGL 5</span>
        </div>
        <p class="text-lg font-mono font-bold text-text-primary">Rp 100.000</p>
        <p class="text-xs text-text-secondary">Rencana pembayaran setiap tanggal 5 awal bulan.</p>
      </div>

      <!-- Weather Alert: Malang -->
      <div class="bg-surface rounded-2xl p-4 border-l-4 border-tosca border border-border space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-xs font-mono font-bold text-tosca flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">partly_cloudy_day</span> CUACA KOTA MALANG
          </span>
          <span class="text-[10px] font-mono text-lime font-bold">REALTIME</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-2xl font-mono font-bold text-text-primary">26°C</span>
          <p class="text-xs text-text-secondary">Cerah Berawan • Suhu dan jalanan ideal untuk narik Gojek sore ini.</p>
        </div>
      </div>
    </section>

    <!-- ======================================================================= -->
    <!-- ⚙️ TAB 5: PROFILE & SETTINGS -->
    <!-- ======================================================================= -->
    <section id="tab-profile" class="tab-content px-4 py-4 space-y-4">
      <h2 class="font-headline font-bold text-xl text-text-primary">Profil & Pengaturan Sistem</h2>

      <!-- User Badge -->
      <div class="bg-surface rounded-2xl p-4 border border-border flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary font-bold text-lg">
          MF
        </div>
        <div>
          <h3 class="font-headline font-bold text-base text-text-primary">Mas Firman</h3>
          <p class="text-xs font-mono text-primary flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">verified</span> Single-User Verified (1084842050)
          </p>
        </div>
      </div>

      <!-- Theme Switcher -->
      <div class="bg-surface rounded-2xl p-4 border border-border flex justify-between items-center">
        <div>
          <h4 class="font-bold text-sm text-text-primary">Mode Tampilan</h4>
          <p class="text-xs text-text-secondary">Dark Mode / Light Mode</p>
        </div>
        <button onclick="toggleTheme()" class="px-4 py-2 bg-surface-elevated rounded-xl border border-border font-mono text-xs font-bold flex items-center gap-2 text-text-primary">
          <span class="material-symbols-outlined text-[16px] text-lime" id="theme-icon">dark_mode</span>
          <span id="theme-label">DARK</span>
        </button>
      </div>

      <!-- Wallet Balances Overview -->
      <div class="bg-surface rounded-2xl p-4 border border-border space-y-3 font-mono">
        <h4 class="font-bold text-xs uppercase text-text-secondary tracking-wider">Status Dompet Terhubung</h4>
        <div class="space-y-2 text-xs">
          <div class="flex justify-between p-2 rounded-lg bg-surface-elevated">
            <span>💵 Cash Kertas</span>
            <span class="font-bold text-lime">Rp 152.000</span>
          </div>
          <div class="flex justify-between p-2 rounded-lg bg-surface-elevated">
            <span>🪙 Cash Koin</span>
            <span class="font-bold text-lime">Rp 9.500</span>
          </div>
          <div class="flex justify-between p-2 rounded-lg bg-surface-elevated">
            <span>📱 Gopay Driver</span>
            <span class="font-bold text-tosca">Rp 164.000</span>
          </div>
          <div class="flex justify-between p-2 rounded-lg bg-surface-elevated">
            <span>🏦 SeaBank & Bank Jago</span>
            <span class="font-bold text-text-primary">Rp 0</span>
          </div>
        </div>
      </div>

      <!-- Security Protocol -->
      <div class="bg-surface rounded-2xl p-4 border border-border space-y-1 text-xs">
        <span class="font-mono text-primary font-bold flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">lock</span> PRIVASI 100% TERKUNCI
        </span>
        <p class="text-text-secondary">
          Sistem beroperasi dalam mode privat eksklusif Mas Firman. Akses akun lain telah dinonaktifkan secara permanen.
        </p>
      </div>
    </section>

  </main>

  <!-- ========================================================================= -->
  <!-- 💬 CHAT QUICK ACTIONS & INPUT DOCK (ALWAYS VISIBLE IN TAB 3) -->
  <!-- ========================================================================= -->
  <div id="chat-input-wrapper" class="fixed bottom-20 left-0 right-0 z-30 px-4 max-w-xl mx-auto space-y-2">
    
    <!-- Quick Action Pills (Horizontal Scroll) -->
    <div class="flex gap-2 overflow-x-auto hide-scrollbar py-1">
      <button onclick="sendQuickAction('rincian plan trip dieng dan progres tabunganku')" class="shrink-0 bg-surface-elevated hover:bg-surface-high border border-border px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 text-tosca transition-colors">
        <span class="material-symbols-outlined text-[14px]">landscape</span> Plan Dieng
      </button>
      <button onclick="sendQuickAction('cek saldo realtime seluruh dompetku')" class="shrink-0 bg-surface-elevated hover:bg-surface-high border border-border px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 text-lime transition-colors">
        <span class="material-symbols-outlined text-[14px]">account_balance_wallet</span> Cek Saldo
      </button>
      <button onclick="sendQuickAction('hitung estimasi bensin honda beat')" class="shrink-0 bg-surface-elevated hover:bg-surface-high border border-border px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 text-amber transition-colors">
        <span class="material-symbols-outlined text-[14px]">local_gas_station</span> Hitung Bensin
      </button>
      <button onclick="sendQuickAction('tampilkan gantt chart kegiatan saya')" class="shrink-0 bg-surface-elevated hover:bg-surface-high border border-border px-3 py-1.5 rounded-full text-xs font-mono flex items-center gap-1.5 text-primary transition-colors">
        <span class="material-symbols-outlined text-[14px]">calendar_month</span> Gantt Chart
      </button>
    </div>

    <!-- Floating Elevated Input Bar -->
    <div class="glass-panel rounded-full p-1.5 pl-4 pr-1.5 flex items-center gap-2 border border-border focus-within:border-primary tosca-bloom transition-all">
      <button class="text-text-secondary hover:text-primary transition-colors">
        <span class="material-symbols-outlined text-[20px]">add_circle</span>
      </button>
      <input id="chat-input-text" type="text" placeholder="Tanya asisten atau catat pengeluaran..." class="flex-1 bg-transparent border-none focus:ring-0 text-xs font-body text-text-primary placeholder:text-text-secondary/50 h-9 outline-none" onkeydown="if(event.key==='Enter') sendMessage()"/>
      <button onclick="startVoiceSTT()" class="text-text-secondary hover:text-lime transition-colors p-1">
        <span class="material-symbols-outlined text-[20px]">mic</span>
      </button>
      <button onclick="sendMessage()" class="w-9 h-9 rounded-full bg-lime text-black flex items-center justify-center font-bold hover:scale-105 transition-transform lime-glow">
        <span class="material-symbols-outlined text-[18px]">send</span>
      </button>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- 🧭 BOTTOM NAVIGATION BAR (5 TABS - CENTER HERO IS TAB 3) -->
  <!-- ========================================================================= -->
  <nav class="fixed bottom-3 left-1/2 -translate-x-1/2 w-[92%] max-w-md h-16 rounded-full glass-panel border border-border/80 shadow-2xl z-50 flex justify-around items-center px-3">
    
    <!-- Tab 1: Analytics -->
    <button onclick="switchTab('analytics')" id="nav-btn-analytics" class="p-2.5 text-text-secondary hover:text-primary transition-colors flex flex-col items-center">
      <span class="material-symbols-outlined text-[22px]">analytics</span>
    </button>

    <!-- Tab 2: Data Core -->
    <button onclick="switchTab('data')" id="nav-btn-data" class="p-2.5 text-text-secondary hover:text-primary transition-colors flex flex-col items-center">
      <span class="material-symbols-outlined text-[22px]">storage</span>
    </button>

    <!-- Tab 3 (CENTER HERO / DEFAULT): AI Chat Hub -->
    <button onclick="switchTab('chat')" id="nav-btn-chat" class="w-13 h-13 rounded-full bg-primary text-black flex items-center justify-center tosca-bloom -translate-y-2 border-2 border-background shadow-lg transition-transform hover:scale-110">
      <span class="material-symbols-outlined text-[26px]" style="font-variation-settings: 'FILL' 1;">smart_toy</span>
    </button>

    <!-- Tab 4: Notifications -->
    <button onclick="switchTab('notifications')" id="nav-btn-notifications" class="p-2.5 text-text-secondary hover:text-primary transition-colors flex flex-col items-center">
      <span class="material-symbols-outlined text-[22px]">notifications</span>
    </button>

    <!-- Tab 5: Profile -->
    <button onclick="switchTab('profile')" id="nav-btn-profile" class="p-2.5 text-text-secondary hover:text-primary transition-colors flex flex-col items-center">
      <span class="material-symbols-outlined text-[22px]">settings</span>
    </button>

  </nav>

  <!-- ========================================================================= -->
  <!-- ⚡ CLIENT-SIDE APPLICATION SCRIPT (INTERACTIVE LOGIC) -->
  <!-- ========================================================================= -->
  <script>
    const USER_ID = "fc2758d3-78bb-4e22-b9f0-b3b16568b671";
    const API_BASE = "https://ai-personal-asistan-telegram.vercel.app";

    function switchTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      const activeEl = document.getElementById('tab-' + tabId);
      if (activeEl) activeEl.classList.add('active');

      const chatInputWrapper = document.getElementById('chat-input-wrapper');
      if (tabId === 'chat') {
        chatInputWrapper.style.display = 'block';
      } else {
        chatInputWrapper.style.display = 'none';
      }

      // Reset nav icons style
      const navButtons = ['analytics', 'data', 'chat', 'notifications', 'profile'];
      navButtons.forEach(btn => {
        const el = document.getElementById('nav-btn-' + btn);
        if (el) {
          if (btn === 'chat') {
            el.className = tabId === 'chat' 
              ? "w-13 h-13 rounded-full bg-lime text-black flex items-center justify-center lime-glow -translate-y-2 border-2 border-background shadow-lg transition-transform scale-110"
              : "w-13 h-13 rounded-full bg-surface-elevated text-text-secondary flex items-center justify-center -translate-y-2 border-2 border-background shadow-lg transition-transform";
          } else {
            el.className = tabId === btn 
              ? "p-2.5 text-primary flex flex-col items-center" 
              : "p-2.5 text-text-secondary hover:text-primary transition-colors flex flex-col items-center";
          }
        }
      });
    }

    function switchDataSubView(sub) {
      const vGantt = document.getElementById('sub-view-gantt');
      const vLedger = document.getElementById('sub-view-ledger');
      const btnGantt = document.getElementById('sub-btn-gantt');
      const btnLedger = document.getElementById('sub-btn-ledger');

      if (sub === 'gantt') {
        vGantt.style.display = 'block';
        vLedger.style.display = 'none';
        btnGantt.className = "flex-1 py-2 rounded-lg text-xs font-mono font-bold bg-primary text-black transition-all";
        btnLedger.className = "flex-1 py-2 rounded-lg text-xs font-mono font-bold text-text-secondary hover:text-text-primary transition-all";
      } else {
        vGantt.style.display = 'none';
        vLedger.style.display = 'block';
        btnLedger.className = "flex-1 py-2 rounded-lg text-xs font-mono font-bold bg-primary text-black transition-all";
        btnGantt.className = "flex-1 py-2 rounded-lg text-xs font-mono font-bold text-text-secondary hover:text-text-primary transition-all";
        loadLedgerData();
      }
    }

    function toggleTheme() {
      const html = document.documentElement;
      const isDark = html.classList.contains('dark');
      if (isDark) {
        html.classList.remove('dark');
        html.classList.add('light');
        document.getElementById('theme-icon').textContent = 'light_mode';
        document.getElementById('theme-label').textContent = 'LIGHT';
      } else {
        html.classList.remove('light');
        html.classList.add('dark');
        document.getElementById('theme-icon').textContent = 'dark_mode';
        document.getElementById('theme-label').textContent = 'DARK';
      }
    }

    async function sendMessage() {
      const input = document.getElementById('chat-input-text');
      const text = input.value.trim();
      if (!text) return;

      appendUserBubble(text);
      input.value = '';

      const container = document.getElementById('chat-messages-container');
      const typingId = 'typing-' + Date.now();
      container.innerHTML += \`
        <div id="\${typingId}" class="flex items-center gap-2 text-xs font-mono text-lime animate-pulse">
          <span class="material-symbols-outlined text-[16px]">smart_toy</span> Butler sedang memproses analisis...
        </div>
      \`;
      container.scrollTop = container.scrollHeight;

      try {
        const res = await fetch(\`\${API_BASE}/api/mobile/chat\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: USER_ID,
            userMessage: text,
            userName: 'Mas Firman'
          })
        });
        const data = await res.json();
        document.getElementById(typingId)?.remove();

        if (data.messages && data.messages.length > 0) {
          data.messages.forEach(msg => appendButlerBubble(msg));
        } else {
          appendButlerBubble(data.error || 'Perintah telah berhasil diproses.');
        }
      } catch (err) {
        document.getElementById(typingId)?.remove();
        appendButlerBubble('⚠️ Gagal terhubung ke server. Menggunakan mode cadangan.');
      }
    }

    function sendQuickAction(queryText) {
      document.getElementById('chat-input-text').value = queryText;
      sendMessage();
    }

    function appendUserBubble(text) {
      const container = document.getElementById('chat-messages-container');
      container.innerHTML += \`
        <div class="flex justify-end">
          <div class="bg-tosca-dark text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] shadow-lg border border-tosca/40 font-body">
            <p class="leading-relaxed">\${escapeHtml(text)}</p>
            <span class="text-[9px] font-mono opacity-70 block text-right mt-1">\${new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}</span>
          </div>
        </div>
      \`;
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }

    function appendButlerBubble(text) {
      const container = document.getElementById('chat-messages-container');
      const formatted = text.replace(/\\n/g, '<br/>').replace(/\\*\\*(.*?)\\*\\*/g, '<b>$1</b>');
      container.innerHTML += \`
        <div class="flex items-start gap-2.5">
          <div class="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center border border-primary/40 text-primary shrink-0 mt-1">
            <span class="material-symbols-outlined text-[18px]">smart_toy</span>
          </div>
          <div class="bg-surface rounded-2xl rounded-tl-sm p-4 max-w-[90%] border border-border shadow-lg space-y-2 text-text-primary leading-relaxed">
            <div>\${formatted}</div>
            <span class="text-[9px] font-mono text-text-secondary block text-right">\${new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}</span>
          </div>
        </div>
      \`;
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }

    async function loadLedgerData() {
      const c = document.getElementById('ledger-list-container');
      c.innerHTML = '<div class="p-4 text-center font-mono text-xs text-text-secondary">Memuat data transaksi live...</div>';
      try {
        const res = await fetch(\`\${API_BASE}/api/admin/audit-db\`);
        const d = await res.json();
        const txs = d.transactionsSummary?.allTransactions?.slice(0, 15) || [];
        if (txs.length === 0) {
          c.innerHTML = '<div class="p-4 text-center font-mono text-xs text-text-secondary">Belum ada transaksi.</div>';
          return;
        }
        c.innerHTML = txs.map(t => \`
          <div class="bg-surface p-3 rounded-xl border border-border flex justify-between items-center font-mono">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-primary">\${t.id ? t.id.substring(0, 8) : 'TX'}</span>
                <span class="text-[10px] text-text-secondary">\${t.occurred_at ? t.occurred_at.split('T')[0] : ''}</span>
              </div>
              <p class="text-xs text-text-primary font-body mt-0.5">\${t.description || t.merchant || 'Transaksi'}</p>
            </div>
            <span class="text-xs font-bold \${t.type==='income'?'text-emerald':'text-coral'}">
              \${t.type==='income'?'+':'-'}Rp \${Number(t.amount||0).toLocaleString('id-ID')}
            </span>
          </div>
        \`).join('');
      } catch (err) {
        c.innerHTML = '<div class="p-4 text-center font-mono text-xs text-coral">Gagal memuat transaksi live.</div>';
      }
    }

    function startVoiceSTT() {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Fitur Voice STT membutuhkan mikrofon browser Android.');
        return;
      }
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.onstart = () => {
        document.getElementById('chat-input-text').placeholder = '🎙️ Mendengarkan suara Mas Firman...';
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('chat-input-text').value = transcript;
        sendMessage();
      };
      recognition.onerror = () => {
        document.getElementById('chat-input-text').placeholder = 'Tanya asisten atau catat pengeluaran...';
      };
      recognition.start();
    }

    function exportToExcel() {
      window.open(\`\${API_BASE}/api/export?format=csv&userId=\${USER_ID}\`, '_blank');
    }

    function escapeHtml(str) {
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
  </script>
</body>
</html>
`;

export default function MobileAppPage() {
  return (
    <div className="fixed inset-0 w-full h-full bg-[#0B0F12] overflow-hidden flex flex-col justify-center items-center">
      <iframe
        srcDoc={HTML_SOURCE}
        className="w-full h-full border-none"
        title="DATA_CORE_V1 Mobile"
      />
    </div>
  );
}
