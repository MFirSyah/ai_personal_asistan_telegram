'use client';

import React from 'react';

const HTML_SOURCE = `<!DOCTYPE html>
<html lang="id" class="dark">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"/>
  <title>DATA_CORE_V1</title>
  <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet"/>
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
            lime: "#D2F000",
            tosca: "#00B4D8",
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
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      background-color: #0B0F12;
      color: #F8FAFC;
      font-family: 'Inter', sans-serif;
      -webkit-tap-highlight-color: transparent;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .glass-panel {
      background: rgba(20, 26, 32, 0.94);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(40, 50, 62, 0.75);
    }
    .tosca-bloom { box-shadow: 0 0 16px rgba(0, 168, 168, 0.35); }
    .lime-glow { box-shadow: 0 0 16px rgba(210, 240, 0, 0.4); }
    .tab-pane {
      display: none;
      width: 100%;
      height: 100%;
      overflow-y: auto;
      padding-bottom: 140px;
    }
    #tab-chat {
      padding-bottom: 230px !important;
    }
    .gantt-track {
      background: repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(40, 50, 62, 0.4) 40px);
    }
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      z-index: 100;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .modal-overlay.active { display: flex; animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body class="flex flex-col h-full w-full select-none text-xs">

  <!-- ========================================================================= -->
  <!-- 🔝 TOP APP BAR (KLIK IKON ROBOT UNTUK SETTING PREFERENSI AI) -->
  <!-- ========================================================================= -->
  <header class="glass-panel px-4 py-2.5 flex justify-between items-center border-b border-border/50 shrink-0 z-40">
    <div class="flex items-center gap-2.5">
      
      <!-- Interactive Robot Icon -> Opens AI Settings Modal -->
      <button onclick="openAiSettingsModal()" class="relative hover:scale-105 transition-transform focus:outline-none" title="Klik untuk Pengaturan Preferensi AI">
        <div class="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center border border-primary/40 tosca-bloom">
          <span class="material-symbols-outlined text-primary text-[18px]">smart_toy</span>
        </div>
        <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-lime rounded-full border-2 border-background animate-pulse"></div>
      </button>

      <div>
        <h1 class="font-headline font-bold text-sm leading-tight flex items-center gap-1.5 text-text-primary">
          DATA_CORE_V1
          <span class="text-[9px] font-mono px-1 rounded bg-primary/20 text-primary border border-primary/30">PRO</span>
        </h1>
        <p class="text-[10px] font-mono text-lime flex items-center gap-1" id="header-location">
          <span class="w-1.5 h-1.5 rounded-full bg-lime inline-block"></span> MALANG (26°C)
        </p>
      </div>
    </div>

    <!-- Quick Balance Pill -->
    <div class="glass-panel px-2.5 py-1 rounded-full flex items-center gap-2 border border-border/60">
      <div class="flex items-center gap-1">
        <span class="text-[9px] font-mono text-text-secondary">KAS</span>
        <span class="text-[11px] font-mono font-bold text-lime" id="header-cash">Rp 455k</span>
      </div>
      <span class="w-px h-2.5 bg-border"></span>
      <div class="flex items-center gap-1">
        <span class="text-[9px] font-mono text-text-secondary">GOPAY</span>
        <span class="text-[11px] font-mono font-bold text-tosca" id="header-gopay">Rp 164k</span>
      </div>
    </div>
  </header>

  <!-- ========================================================================= -->
  <!-- 📱 MAIN VIEW CANVAS (5 ISOLATED INDEPENDENT TABS) -->
  <!-- ========================================================================= -->
  <main class="flex-1 overflow-hidden relative w-full">

    <!-- ======================================================================= -->
    <!-- 📊 TAB 1: ANALYTICS, SMART INSIGHTS & GANTT CHART -->
    <!-- ======================================================================= -->
    <div id="tab-analytics" class="tab-pane px-4 py-3 space-y-3">
      <div class="flex justify-between items-center">
        <h2 class="font-headline font-bold text-base text-text-primary">Analisis Keuangan & Timeline</h2>
        <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Realtime</span>
      </div>

      <!-- Health Score Card -->
      <div class="bg-surface rounded-xl p-4 border border-border relative overflow-hidden tosca-bloom">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-[9px] font-mono uppercase tracking-widest text-primary font-bold">Financial Health Score</span>
            <h3 class="text-2xl font-mono font-black text-text-primary mt-0.5">88<span class="text-xs text-text-secondary">/100</span></h3>
            <p class="text-[11px] text-text-secondary mt-1 max-w-[220px]">Kondisi Keuangan Sangat Sehat & Beban Cicilan Terkendali.</p>
          </div>
          <div class="w-14 h-14 rounded-full bg-surface-elevated border-2 border-primary flex items-center justify-center font-mono font-bold text-lime text-lg shrink-0">
            A+
          </div>
        </div>
      </div>

      <!-- 2x2 Metric Grid -->
      <div class="grid grid-cols-2 gap-2.5 font-mono">
        <div class="bg-surface rounded-xl p-3 border border-border">
          <span class="text-[9px] text-text-secondary uppercase">Total Pemasukan</span>
          <p class="text-sm font-bold text-emerald mt-0.5">Rp 3.450.000</p>
          <span class="text-[9px] text-emerald">▲ +12% vs lalu</span>
        </div>
        <div class="bg-surface rounded-xl p-3 border border-border">
          <span class="text-[9px] text-text-secondary uppercase">Total Pengeluaran</span>
          <p class="text-sm font-bold text-coral mt-0.5">Rp 2.120.000</p>
          <span class="text-[9px] text-coral">▼ -5% vs lalu</span>
        </div>
        <div class="bg-surface rounded-xl p-3 border border-border">
          <span class="text-[9px] text-text-secondary uppercase">Sisa Kas Likuid</span>
          <p class="text-sm font-bold text-tosca mt-0.5">Rp 1.330.000</p>
          <span class="text-[9px] text-text-secondary">Aman Terjaga</span>
        </div>
        <div class="bg-surface rounded-xl p-3 border border-border">
          <span class="text-[9px] text-text-secondary uppercase">Daily Burn Rate</span>
          <p class="text-sm font-bold text-lime mt-0.5">Rp 68.000<span class="text-[9px] text-text-secondary">/hr</span></p>
          <span class="text-[9px] text-lime">Stabil Normal</span>
        </div>
      </div>

      <!-- REAL VISUAL GANTT CHART IN TAB 1 -->
      <div class="bg-surface rounded-xl p-3.5 border border-border space-y-2.5 shadow-md">
        <div class="flex justify-between items-center text-[10px] font-mono text-text-secondary border-b border-border/50 pb-2">
          <span class="font-bold text-text-primary flex items-center gap-1">
            <span class="material-symbols-outlined text-primary text-[14px]">calendar_view_month</span> TIMELINE GANTT CHART 2026
          </span>
          <span class="px-2 py-0.5 rounded bg-coral/20 text-coral font-bold flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-coral inline-block"></span> HARI INI (27 AGS)
          </span>
        </div>

        <div class="overflow-x-auto hide-scrollbar rounded-lg border border-border/60 bg-background p-3">
          <div class="min-w-[560px] space-y-3 relative">
            <div class="grid grid-cols-12 text-[9px] font-mono text-text-secondary border-b border-border/40 pb-1.5 text-center">
              <div class="col-span-4 border-r border-border/30">1 - 10 AGUSTUS</div>
              <div class="col-span-4 border-r border-border/30">11 - 20 AGUSTUS</div>
              <div class="col-span-4 text-lime font-bold">21 - 31 AGUSTUS</div>
            </div>

            <div class="absolute top-7 bottom-0 left-[82%] w-0.5 bg-coral z-20 pointer-events-none opacity-80">
              <span class="absolute -top-3 -left-3 bg-coral text-white text-[8px] font-bold px-1 rounded">TODAY</span>
            </div>

            <div class="space-y-2.5 pt-1 text-[10px] font-mono">
              <div class="space-y-1">
                <div class="flex justify-between items-center text-[10px]">
                  <span class="font-bold text-text-primary flex items-center gap-1">
                    <span class="material-symbols-outlined text-tosca text-[13px]">landscape</span> Trip ke Dieng (22 - 30 Ags)
                  </span>
                  <span class="text-tosca font-bold">50% Prep (Sisa Rp 740k)</span>
                </div>
                <div class="relative h-6 bg-surface-elevated rounded-md overflow-hidden gantt-track border border-border/40">
                  <div class="absolute left-[70%] right-[3%] top-1 bottom-1 bg-gradient-to-r from-tosca to-primary rounded flex items-center px-2 shadow-md">
                    <span class="text-[9px] font-bold text-black truncate">29-30 Ags (2 Hari)</span>
                  </div>
                </div>
              </div>

              <div class="space-y-1">
                <div class="flex justify-between items-center text-[10px]">
                  <span class="font-bold text-text-primary flex items-center gap-1">
                    <span class="material-symbols-outlined text-amber text-[13px]">two_wheeler</span> Narik Gojek Rutin Malang
                  </span>
                  <span class="text-amber font-bold">Aktif Harian (Rp 150k/hr)</span>
                </div>
                <div class="relative h-6 bg-surface-elevated rounded-md overflow-hidden gantt-track border border-border/40">
                  <div class="absolute left-[5%] right-[5%] top-1 bottom-1 bg-amber/30 border border-amber rounded flex items-center px-2">
                    <span class="text-[9px] font-bold text-amber truncate">Shift Siang & Malam</span>
                  </div>
                </div>
              </div>

              <div class="space-y-1">
                <div class="flex justify-between items-center text-[10px]">
                  <span class="font-bold text-text-primary flex items-center gap-1">
                    <span class="material-symbols-outlined text-emerald text-[13px]">school</span> Wisuda Telkom University
                  </span>
                  <span class="text-emerald font-bold">100% Selesai</span>
                </div>
                <div class="relative h-6 bg-surface-elevated rounded-md overflow-hidden gantt-track border border-border/40">
                  <div class="absolute left-[35%] right-[55%] top-1 bottom-1 bg-emerald rounded flex items-center justify-center shadow-md">
                    <span class="text-[9px] font-bold text-black">12 Ags (Sukses)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sinking Fund & Loan Overview -->
      <div class="bg-surface rounded-xl p-3.5 border border-border space-y-2.5">
        <h4 class="font-headline font-bold text-[10px] uppercase text-text-secondary tracking-wider">Target & Beban Cicilan</h4>
        <div class="space-y-2 font-mono text-[11px]">
          <div class="p-2.5 rounded-lg bg-surface-elevated space-y-1">
            <div class="flex justify-between">
              <span>🎯 Trip Dieng (Rp 1.040.000)</span>
              <span class="text-lime font-bold">Terbayar: Rp 300.000 (29%)</span>
            </div>
            <div class="w-full h-2 bg-surface rounded-full overflow-hidden">
              <div class="h-full bg-primary rounded-full" style="width: 29%"></div>
            </div>
            <div class="flex justify-between text-[9px] text-text-secondary">
              <span>🗓️ 29-30 Agustus 2026</span>
              <span>Sisa: Rp 740.000</span>
            </div>
          </div>
          <div class="p-2.5 rounded-lg bg-surface-elevated space-y-1">
            <div class="flex justify-between">
              <span>💳 Bank Jago (Rp 67.940/bln)</span>
              <span class="text-coral font-bold">Jatuh Tempo: Tgl 20</span>
            </div>
            <div class="w-full h-2 bg-surface rounded-full overflow-hidden">
              <div class="h-full bg-amber rounded-full" style="width: 8%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================================= -->
    <!-- 🗄️ TAB 2: DATA CORE & TRANSACTIONS DATABASE (LEDGER MURNI) -->
    <!-- ======================================================================= -->
    <div id="tab-data" class="tab-pane px-4 py-3 space-y-3">
      <div class="flex justify-between items-center">
        <h2 class="font-headline font-bold text-base text-text-primary">Database Transaksi Keuangan</h2>
        <div class="flex gap-1.5">
          <button onclick="openAddModal()" class="px-2.5 py-1 bg-lime text-black font-mono font-bold text-[10px] rounded-lg flex items-center gap-1 shadow-md">
            <span class="material-symbols-outlined text-[14px]">add</span> Tambah
          </button>
          <button onclick="exportToExcel()" class="px-2 py-1 bg-primary/20 border border-primary text-primary text-[10px] font-mono font-bold rounded-lg flex items-center gap-1">
            <span class="material-symbols-outlined text-[12px]">download</span> Excel
          </button>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="space-y-2">
        <div class="flex gap-1.5 overflow-x-auto hide-scrollbar text-[10px] font-mono py-0.5">
          <button onclick="filterWallet('all')" class="px-2.5 py-1 bg-primary text-black font-bold rounded-full shrink-0">Semua</button>
          <button onclick="filterWallet('Cash')" class="px-2.5 py-1 bg-surface-elevated text-text-secondary rounded-full border border-border shrink-0">Cash</button>
          <button onclick="filterWallet('Gopay')" class="px-2.5 py-1 bg-surface-elevated text-text-secondary rounded-full border border-border shrink-0">Gopay</button>
          <button onclick="filterWallet('Jago')" class="px-2.5 py-1 bg-surface-elevated text-text-secondary rounded-full border border-border shrink-0">Bank Jago</button>
        </div>

        <div id="ledger-list-container" class="space-y-1.5">
          <!-- Live items will load here -->
        </div>
      </div>
    </div>

    <!-- ======================================================================= -->
    <!-- 💬 TAB 3: AI BUTLER CHAT HUB (CENTER HERO & DEFAULT SCREEN) -->
    <!-- ======================================================================= -->
    <div id="tab-chat" class="tab-pane px-4 py-3 space-y-3" style="display: block;">
      
      <!-- Timestamp Badge -->
      <div class="text-center my-1">
        <span class="text-[9px] font-mono text-text-secondary bg-surface-elevated px-2.5 py-0.5 rounded-full border border-border/50">
          HARI INI, 27 AGUSTUS 2026
        </span>
      </div>

      <!-- Message Stream Container -->
      <div id="chat-messages-container" class="space-y-3 w-full">
        
        <!-- Welcome Butler Message -->
        <div class="flex items-start gap-2">
          <div class="w-7 h-7 rounded-full bg-surface-elevated flex items-center justify-center border border-primary/40 text-primary shrink-0 mt-0.5">
            <span class="material-symbols-outlined text-[16px]">smart_toy</span>
          </div>
          <div class="bg-surface rounded-xl rounded-tl-sm p-3 max-w-[92%] border border-border shadow-lg space-y-2.5">
            <p class="text-text-primary text-[11px] leading-relaxed">
              Selamat datang, <b>Mas Firman</b>. Asisten AI Butler siap mendampingi pencatatan keuangan, progres sinking fund, analisis narik Gojek, dan timeline agenda Anda.
            </p>

            <!-- Dieng Progress Card Widget -->
            <div class="bg-background rounded-lg p-2.5 border-l-2 border-primary space-y-1.5 font-mono text-[10px]">
              <div class="flex justify-between items-center">
                <span class="font-bold text-primary flex items-center gap-1">
                  <span class="material-symbols-outlined text-[12px]">landscape</span> Plan Trip Dieng
                </span>
                <span class="text-lime">29-30 Ags</span>
              </div>
              <div class="grid grid-cols-2 gap-0.5">
                <span class="text-text-secondary">Pagu Anggaran:</span>
                <span class="text-right text-text-primary">Rp 1.040.000</span>
                <span class="text-text-secondary">Cicilan Masuk (3x):</span>
                <span class="text-right text-lime font-bold">Rp 300.000</span>
                <span class="text-text-secondary">Sisa Kekurangan:</span>
                <span class="text-right text-tosca font-bold">Rp 740.000</span>
              </div>
            </div>

            <!-- Honda Beat Fuel Widget -->
            <div class="bg-background rounded-lg p-2.5 border border-border flex items-center gap-2">
              <div class="p-1.5 rounded bg-surface-elevated text-lime">
                <span class="material-symbols-outlined text-[16px]">local_gas_station</span>
              </div>
              <div class="font-mono text-[10px]">
                <p class="font-bold text-text-primary">Honda Beat FI (Pertalite)</p>
                <p class="text-text-secondary">Konsumsi: ~50 KM/L • Biaya: ~Rp 200/KM</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- ======================================================================= -->
    <!-- 🔔 TAB 4: NOTIFICATIONS & SMART ALERTS (REAL GPS WEATHER) -->
    <!-- ======================================================================= -->
    <div id="tab-notifications" class="tab-pane px-4 py-3 space-y-2.5">
      <h2 class="font-headline font-bold text-base text-text-primary">Pusat Notifikasi & Pengingat</h2>

      <!-- Live GPS Weather Card -->
      <div class="bg-surface rounded-xl p-3.5 border-l-4 border-tosca border border-border space-y-2 shadow-md">
        <div class="flex justify-between items-center">
          <span class="text-[10px] font-mono font-bold text-tosca flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">near_me</span> CUACA REALTIME LOKASI ANDA
          </span>
          <span class="text-[9px] font-mono text-lime font-bold" id="weather-badge">GPS LIVE</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-3xl font-mono font-bold text-text-primary" id="weather-temp">26°C</span>
            <div>
              <h3 class="font-bold text-xs text-text-primary" id="weather-city">Kota Malang, Jawa Timur</h3>
              <p class="text-[11px] text-text-secondary" id="weather-desc">Cerah Berawan • Angin 9 km/jam</p>
            </div>
          </div>
        </div>
        <div class="p-2 rounded bg-surface-elevated font-mono text-[10px] text-lime flex items-center gap-1.5" id="weather-advice">
          <span class="material-symbols-outlined text-[14px]">check_circle</span> Kondisi jalanan kering & ideal untuk narik Gojek sore/malam ini.
        </div>
      </div>

      <!-- Urgent Card: Bank Jago -->
      <div class="bg-surface rounded-xl p-3 border-l-4 border-coral border border-border space-y-1 shadow-md">
        <div class="flex justify-between items-center">
          <span class="text-[10px] font-mono font-bold text-coral flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">warning</span> CICILAN BANK JAGO
          </span>
          <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-coral/20 text-coral font-bold">TGL 20</span>
        </div>
        <p class="text-base font-mono font-bold text-text-primary">Rp 67.940 <span class="text-[10px] text-text-secondary font-normal">/ bulan</span></p>
        <p class="text-[11px] text-text-secondary">Autodebet setiap tanggal 20. Sisa tenor 11 bulan (Pokok Rp 50.000 + Bunga Rp 17.940).</p>
      </div>

      <!-- Debt Card: Rifky -->
      <div class="bg-surface rounded-xl p-3 border-l-4 border-amber border border-border space-y-1">
        <div class="flex justify-between items-center">
          <span class="text-[10px] font-mono font-bold text-amber flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">handshake</span> HUTANG KE RIFKY
          </span>
          <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber/20 text-amber font-bold">TGL 5</span>
        </div>
        <p class="text-base font-mono font-bold text-text-primary">Rp 100.000</p>
        <p class="text-[11px] text-text-secondary">Rencana pembayaran setiap tanggal 5 awal bulan.</p>
      </div>
    </div>

    <!-- ======================================================================= -->
    <!-- ⚙️ TAB 5: PROFILE & SYSTEM SETTINGS -->
    <!-- ======================================================================= -->
    <div id="tab-profile" class="tab-pane px-4 py-3 space-y-3">
      <h2 class="font-headline font-bold text-base text-text-primary">Profil & Pengaturan Sistem</h2>

      <!-- User Badge -->
      <div class="bg-surface rounded-xl p-3.5 border border-border flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary font-bold text-base shrink-0">
            MF
          </div>
          <div>
            <h3 class="font-headline font-bold text-sm text-text-primary">Mas Firman</h3>
            <p class="text-[10px] font-mono text-primary flex items-center gap-1">
              <span class="material-symbols-outlined text-[12px]">verified</span> Verified Single-User (ID: 1084842050)
            </p>
          </div>
        </div>
        <button onclick="openAiSettingsModal()" class="px-2.5 py-1.5 bg-primary/20 border border-primary rounded-lg text-primary text-[10px] font-mono font-bold flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">tune</span> Setting AI
        </button>
      </div>

      <!-- Quick AI Summarizer Action Card in Profile -->
      <div class="bg-surface rounded-xl p-3.5 border border-border space-y-2">
        <div class="flex justify-between items-center">
          <span class="font-headline font-bold text-xs text-text-primary flex items-center gap-1">
            <span class="material-symbols-outlined text-lime text-[14px]">auto_awesome</span> Rangkuman Otomatis AI
          </span>
          <button onclick="openAiSettingsModal()" class="text-lime text-[10px] font-mono font-bold hover:underline">Kelola & Konfigurasi</button>
        </div>
        <p class="text-[11px] text-text-secondary leading-relaxed">
          Sistem secara cerdas merangkum arus kas, burn rate, dan agenda Anda berdasarkan preferensi rentang hari yang Anda tentukan.
        </p>
      </div>

      <!-- Wallet Balances Overview -->
      <div class="bg-surface rounded-xl p-3.5 border border-border space-y-2 font-mono text-[11px]">
        <div class="flex justify-between items-center border-b border-border/50 pb-1.5">
          <span class="font-bold text-text-secondary uppercase text-[10px] tracking-wider">Status Dompet Terhubung</span>
          <button onclick="loadLedgerData()" class="text-primary text-[10px] hover:underline">🔄 Sinkron Ulang</button>
        </div>
        <div class="space-y-1.5">
          <div class="flex justify-between p-2 rounded bg-surface-elevated">
            <span>💵 Cash Kertas</span>
            <span class="font-bold text-lime">Rp 152.000</span>
          </div>
          <div class="flex justify-between p-2 rounded bg-surface-elevated">
            <span>🪙 Cash Koin</span>
            <span class="font-bold text-lime">Rp 9.500</span>
          </div>
          <div class="flex justify-between p-2 rounded bg-surface-elevated">
            <span>📱 Gopay Driver</span>
            <span class="font-bold text-tosca">Rp 164.000</span>
          </div>
          <div class="flex justify-between p-2 rounded bg-surface-elevated">
            <span>🏦 SeaBank</span>
            <span class="font-bold text-text-primary">Rp 0</span>
          </div>
          <div class="flex justify-between p-2 rounded bg-surface-elevated">
            <span>🏦 Bank Jago</span>
            <span class="font-bold text-text-primary">Rp 0</span>
          </div>
        </div>
      </div>

      <!-- System Synchronization Telemetry -->
      <div class="bg-surface rounded-xl p-3 border border-border space-y-1.5 text-[10px] font-mono">
        <span class="text-text-secondary font-bold uppercase tracking-wider">Telemetri Sistem</span>
        <div class="grid grid-cols-2 gap-1.5">
          <div class="p-1.5 rounded bg-surface-elevated flex justify-between items-center">
            <span>Supabase DB:</span>
            <span class="text-emerald font-bold">🟢 Connected</span>
          </div>
          <div class="p-1.5 rounded bg-surface-elevated flex justify-between items-center">
            <span>Keep-Alive:</span>
            <span class="text-emerald font-bold">🟢 Active</span>
          </div>
        </div>
      </div>
    </div>

  </main>

  <!-- ========================================================================= -->
  <!-- 💬 CHAT INPUT DOCK (HANYA MUNCUL DI TAB 3) -->
  <!-- ========================================================================= -->
  <div id="chat-input-wrapper" class="fixed bottom-16 left-0 right-0 z-30 px-3 max-w-lg mx-auto space-y-1.5">
    
    <!-- Quick Action Pills -->
    <div class="flex gap-1.5 overflow-x-auto hide-scrollbar py-0.5">
      <button onclick="sendQuickAction('rincian plan trip dieng dan sisa cicilan tiketku')" class="shrink-0 bg-surface-elevated hover:bg-surface-high border border-border px-2.5 py-1 rounded-full text-[10px] font-mono flex items-center gap-1 text-tosca">
        <span class="material-symbols-outlined text-[12px]">landscape</span> Plan Dieng
      </button>
      <button onclick="sendQuickAction('cek saldo realtime seluruh dompetku')" class="shrink-0 bg-surface-elevated hover:bg-surface-high border border-border px-2.5 py-1 rounded-full text-[10px] font-mono flex items-center gap-1 text-lime">
        <span class="material-symbols-outlined text-[12px]">account_balance_wallet</span> Cek Saldo
      </button>
      <button onclick="sendQuickAction('hitung estimasi bensin honda beat')" class="shrink-0 bg-surface-elevated hover:bg-surface-high border border-border px-2.5 py-1 rounded-full text-[10px] font-mono flex items-center gap-1 text-amber">
        <span class="material-symbols-outlined text-[12px]">local_gas_station</span> Hitung Bensin
      </button>
      <button onclick="sendQuickAction('tampilkan visual gantt chart')" class="shrink-0 bg-surface-elevated hover:bg-surface-high border border-border px-2.5 py-1 rounded-full text-[10px] font-mono flex items-center gap-1 text-primary">
        <span class="material-symbols-outlined text-[12px]">calendar_month</span> Gantt Chart
      </button>
    </div>

    <!-- Floating Input Bar -->
    <div class="glass-panel rounded-full p-1 pl-3 pr-1 flex items-center gap-1.5 border border-border focus-within:border-primary tosca-bloom">
      <input id="chat-input-text" type="text" placeholder="Tanya asisten atau catat pengeluaran..." class="flex-1 bg-transparent border-none focus:ring-0 text-[11px] font-body text-text-primary placeholder:text-text-secondary/50 h-8 outline-none" onkeydown="if(event.key==='Enter') sendMessage()"/>
      <button onclick="startVoiceSTT()" class="text-text-secondary hover:text-lime p-1">
        <span class="material-symbols-outlined text-[18px]">mic</span>
      </button>
      <button onclick="sendMessage()" class="w-8 h-8 rounded-full bg-lime text-black flex items-center justify-center font-bold hover:scale-105 transition-transform lime-glow shrink-0">
        <span class="material-symbols-outlined text-[16px]">send</span>
      </button>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- 🧭 BOTTOM NAVIGATION BAR (5 TABS - CENTER HERO IS TAB 3) -->
  <!-- ========================================================================= -->
  <nav class="fixed bottom-2 left-1/2 -translate-x-1/2 w-[94%] max-w-md h-14 rounded-full glass-panel border border-border/80 shadow-2xl z-50 flex justify-around items-center px-2">
    
    <!-- Tab 1: Analytics -->
    <button onclick="switchTab('analytics')" id="nav-btn-analytics" class="p-2 text-text-secondary hover:text-primary transition-colors flex flex-col items-center">
      <span class="material-symbols-outlined text-[20px]">analytics</span>
    </button>

    <!-- Tab 2: Data Core -->
    <button onclick="switchTab('data')" id="nav-btn-data" class="p-2 text-text-secondary hover:text-primary transition-colors flex flex-col items-center">
      <span class="material-symbols-outlined text-[20px]">storage</span>
    </button>

    <!-- Tab 3 (CENTER HERO / DEFAULT): AI Chat Hub -->
    <button onclick="switchTab('chat')" id="nav-btn-chat" class="w-11 h-11 rounded-full bg-lime text-black flex items-center justify-center lime-glow -translate-y-2 border-2 border-background shadow-lg transition-transform scale-105">
      <span class="material-symbols-outlined text-[22px]" style="font-variation-settings: 'FILL' 1;">smart_toy</span>
    </button>

    <!-- Tab 4: Notifications -->
    <button onclick="switchTab('notifications')" id="nav-btn-notifications" class="p-2 text-text-secondary hover:text-primary transition-colors flex flex-col items-center">
      <span class="material-symbols-outlined text-[20px]">notifications</span>
    </button>

    <!-- Tab 5: Profile -->
    <button onclick="switchTab('profile')" id="nav-btn-profile" class="p-2 text-text-secondary hover:text-primary transition-colors flex flex-col items-center">
      <span class="material-symbols-outlined text-[20px]">settings</span>
    </button>

  </nav>

  <!-- ========================================================================= -->
  <!-- 🤖 MODAL DIALOG: PENGATURAN PREFERENSI AI & AUTO-SUMMARIZER ENGINE -->
  <!-- ========================================================================= -->
  <div id="modal-ai-settings" class="modal-overlay">
    <div class="bg-surface border border-border rounded-2xl p-4 w-full max-w-sm space-y-3 font-mono max-h-[90vh] overflow-y-auto hide-scrollbar">
      <div class="flex justify-between items-center border-b border-border/50 pb-2">
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-primary text-[18px]">tune</span>
          <h3 class="font-headline font-bold text-sm text-text-primary">Pengaturan Preferensi AI</h3>
        </div>
        <button onclick="closeAiSettingsModal()" class="text-text-secondary hover:text-text-primary text-sm font-bold">✕</button>
      </div>

      <!-- Segmented Mode Switcher for AI Preferences -->
      <div class="flex bg-surface-elevated p-1 rounded-xl border border-border">
        <button id="ai-mode-desc-btn" onclick="switchAiMode('desc')" class="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-primary text-black transition-all">
          📝 Deskripsi Bebas
        </button>
        <button id="ai-mode-bullet-btn" onclick="switchAiMode('bullet')" class="flex-1 py-1.5 rounded-lg text-[10px] font-bold text-text-secondary transition-all">
          • Bullet Points
        </button>
      </div>

      <!-- Mode 1: Deskripsi Bebas -->
      <div id="ai-mode-desc-view" class="space-y-1.5">
        <label class="text-[10px] text-text-secondary uppercase">Instruksi Deskripsi Personal</label>
        <textarea id="ai-pref-desc-input" rows="4" placeholder="Contoh: Saya sedang menabung untuk trip Dieng dan bayar cicilan Bank Jago. Jika saya tanya pengeluaran, selalu ingatkan sisa kas likuid dan hitung efisiensi bensin Honda Beat." class="w-full bg-surface-elevated border border-border rounded-lg p-2 text-text-primary text-xs outline-none resize-none font-body leading-relaxed"></textarea>
      </div>

      <!-- Mode 2: Bullet Points -->
      <div id="ai-mode-bullet-view" class="space-y-1.5" style="display: none;">
        <label class="text-[10px] text-text-secondary uppercase">Instruksi Poin-Poin (Per Baris)</label>
        <textarea id="ai-pref-bullet-input" rows="4" placeholder="- Prioritaskan sinking fund Trip Dieng (Rp 1.040.000)
- Selalu hitung konsumsi bensin Beat 50km/liter
- Ingatkan jatuh tempo Bank Jago tgl 20
- Bersikap sopan dan panggil Mas Firman" class="w-full bg-surface-elevated border border-border rounded-lg p-2 text-text-primary text-xs outline-none resize-none font-body leading-relaxed"></textarea>
      </div>

      <button onclick="saveManualAiPreference()" class="w-full py-2 bg-primary text-black font-bold rounded-lg text-xs shadow-md flex items-center justify-center gap-1">
        <span class="material-symbols-outlined text-[14px]">save</span> Simpan Preferensi AI
      </button>

      <!-- Auto-Summarizer Section -->
      <div class="border-t border-border/50 pt-2.5 space-y-2">
        <div class="flex justify-between items-center">
          <span class="font-headline font-bold text-xs text-text-primary flex items-center gap-1">
            <span class="material-symbols-outlined text-lime text-[14px]">auto_awesome</span> Rangkuman Otomatis
          </span>
          <span class="text-[9px] text-lime font-bold">Auto-Engine</span>
        </div>
        
        <div class="flex items-center gap-2 text-xs">
          <span class="text-[10px] text-text-secondary">Rentang Hari:</span>
          <select id="auto-summary-days" class="flex-1 bg-surface-elevated border border-border rounded-lg p-1.5 text-text-primary outline-none text-xs">
            <option value="3">3 Hari Terakhir</option>
            <option value="7" selected>7 Hari Terakhir (Mingguan)</option>
            <option value="14">14 Hari Terakhir</option>
            <option value="30">30 Hari Terakhir (Bulanan)</option>
          </select>
        </div>

        <button onclick="generateAutoSummary()" class="w-full py-2 bg-lime text-black font-bold rounded-lg text-xs shadow-md flex items-center justify-center gap-1">
          <span class="material-symbols-outlined text-[14px]">bolt</span> Generate Rangkuman Sekarang
        </button>

        <div id="summary-result-container" class="hidden p-2 rounded-lg bg-surface-elevated border border-border text-[10px] text-text-primary font-mono whitespace-pre-wrap leading-relaxed">
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- 📝 MODAL DIALOG: TAMBAH DATA (TRANSAKSI) -->
  <!-- ========================================================================= -->
  <div id="modal-add" class="modal-overlay">
    <div class="bg-surface border border-border rounded-2xl p-4 w-full max-w-sm space-y-3 font-mono">
      <div class="flex justify-between items-center border-b border-border/50 pb-2">
        <h3 class="font-headline font-bold text-sm text-text-primary" id="modal-title">Tambah Transaksi Baru</h3>
        <button onclick="closeModal()" class="text-text-secondary hover:text-text-primary text-sm font-bold">✕</button>
      </div>

      <div class="space-y-2 text-xs">
        <div>
          <label class="text-[10px] text-text-secondary uppercase">Jenis</label>
          <select id="modal-tx-type" class="w-full bg-surface-elevated border border-border rounded-lg p-2 text-text-primary outline-none mt-0.5">
            <option value="expense">Pengeluaran (Expense)</option>
            <option value="income">Pemasukan (Income)</option>
          </select>
        </div>
        <div>
          <label class="text-[10px] text-text-secondary uppercase">Nominal (Rp)</label>
          <input id="modal-tx-amount" type="number" placeholder="Contoh: 50000" class="w-full bg-surface-elevated border border-border rounded-lg p-2 text-text-primary outline-none mt-0.5"/>
        </div>
        <div>
          <label class="text-[10px] text-text-secondary uppercase">Dompet / Sumber Dana</label>
          <select id="modal-tx-wallet" class="w-full bg-surface-elevated border border-border rounded-lg p-2 text-text-primary outline-none mt-0.5">
            <option value="Cash Kertas">Cash Kertas</option>
            <option value="Gopay">Gopay</option>
            <option value="Bank Jago">Bank Jago</option>
            <option value="SeaBank">SeaBank</option>
          </select>
        </div>
        <div>
          <label class="text-[10px] text-text-secondary uppercase">Keterangan / Merchant</label>
          <input id="modal-tx-desc" type="text" placeholder="Contoh: Bensin Honda Beat" class="w-full bg-surface-elevated border border-border rounded-lg p-2 text-text-primary outline-none mt-0.5"/>
        </div>
      </div>

      <div class="flex gap-2 pt-2">
        <button onclick="closeModal()" class="flex-1 py-2 bg-surface-elevated text-text-secondary font-bold rounded-lg border border-border text-xs">Batal</button>
        <button onclick="submitNewData()" class="flex-1 py-2 bg-lime text-black font-bold rounded-lg text-xs shadow-md">Simpan Data</button>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- ⚡ CLIENT-SIDE APPLICATION SCRIPT -->
  <!-- ========================================================================= -->
  <script>
    const USER_ID = "fc2758d3-78bb-4e22-b9f0-b3b16568b671";
    const API_BASE = "https://ai-personal-asistan-telegram.vercel.app";
    let cachedTransactions = [];
    let currentAiMode = 'desc';

    function switchTab(tabId) {
      const allTabs = ['analytics', 'data', 'chat', 'notifications', 'profile'];
      
      allTabs.forEach(t => {
        const pane = document.getElementById('tab-' + t);
        if (pane) {
          pane.style.display = (t === tabId) ? 'block' : 'none';
        }
      });

      const chatInputWrapper = document.getElementById('chat-input-wrapper');
      if (chatInputWrapper) {
        chatInputWrapper.style.display = (tabId === 'chat') ? 'block' : 'none';
      }

      allTabs.forEach(btn => {
        const el = document.getElementById('nav-btn-' + btn);
        if (el) {
          if (btn === 'chat') {
            el.className = (tabId === 'chat')
              ? "w-11 h-11 rounded-full bg-lime text-black flex items-center justify-center lime-glow -translate-y-2 border-2 border-background shadow-lg transition-transform scale-105"
              : "w-11 h-11 rounded-full bg-surface-elevated text-text-secondary flex items-center justify-center -translate-y-2 border-2 border-background shadow-lg transition-transform";
          } else {
            el.className = (tabId === btn)
              ? "p-2 text-primary flex flex-col items-center"
              : "p-2 text-text-secondary hover:text-primary transition-colors flex flex-col items-center";
          }
        }
      });

      if (tabId === 'data') loadLedgerData();
      if (tabId === 'chat') {
        setTimeout(scrollChatToBottom, 100);
      }
    }

    function scrollChatToBottom() {
      const tabChat = document.getElementById('tab-chat');
      if (tabChat) {
        tabChat.scrollTo({ top: tabChat.scrollHeight + 300, behavior: 'smooth' });
      }
    }

    // --- AI SETTINGS MODAL & LOGIC ---
    function openAiSettingsModal() {
      document.getElementById('modal-ai-settings').classList.add('active');
    }

    function closeAiSettingsModal() {
      document.getElementById('modal-ai-settings').classList.remove('active');
    }

    function switchAiMode(mode) {
      currentAiMode = mode;
      const descView = document.getElementById('ai-mode-desc-view');
      const bulletView = document.getElementById('ai-mode-bullet-view');
      const btnDesc = document.getElementById('ai-mode-desc-btn');
      const btnBullet = document.getElementById('ai-mode-bullet-btn');

      if (mode === 'desc') {
        descView.style.display = 'block';
        bulletView.style.display = 'none';
        btnDesc.className = "flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-primary text-black transition-all";
        btnBullet.className = "flex-1 py-1.5 rounded-lg text-[10px] font-bold text-text-secondary transition-all";
      } else {
        descView.style.display = 'none';
        bulletView.style.display = 'block';
        btnBullet.className = "flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-primary text-black transition-all";
        btnDesc.className = "flex-1 py-1.5 rounded-lg text-[10px] font-bold text-text-secondary transition-all";
      }
    }

    async function saveManualAiPreference() {
      const value = currentAiMode === 'desc'
        ? document.getElementById('ai-pref-desc-input').value.trim()
        : document.getElementById('ai-pref-bullet-input').value.trim();

      if (!value) {
        alert('Mohon isi teks preferensi AI!');
        return;
      }

      const key = currentAiMode === 'desc' ? 'MANUAL_PREFERENCE_DESKRIPSI' : 'MANUAL_PREFERENCE_BULLET_POINTS';

      try {
        await fetch(\`\${API_BASE}/api/mobile/crud\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save_preference',
            payload: {
              user_id: USER_ID,
              key: key,
              value: value
            }
          })
        });
        alert('✅ Preferensi AI berhasil disimpan ke database Supabase!');
        closeAiSettingsModal();
      } catch (e) {
        alert('Gagal menyimpan preferensi AI.');
      }
    }

    async function generateAutoSummary() {
      const days = document.getElementById('auto-summary-days').value;
      const resContainer = document.getElementById('summary-result-container');
      resContainer.classList.remove('hidden');
      resContainer.textContent = '⏳ Sedang mengompilasi rangkuman otomatis...';

      try {
        const res = await fetch(\`\${API_BASE}/api/mobile/crud\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate_auto_summary',
            payload: {
              user_id: USER_ID,
              days: Number(days)
            }
          })
        });
        const data = await res.json();
        if (data.ok && data.summary) {
          resContainer.textContent = data.summary.replace(/\\n/g, '
');
        } else {
          resContainer.textContent = 'Gagal menghasilkan rangkuman.';
        }
      } catch (e) {
        resContainer.textContent = 'Terjadi kesalahan jaringan saat memproses rangkuman.';
      }
    }

    async function sendMessage() {
      const input = document.getElementById('chat-input-text');
      const text = input.value.trim();
      if (!text) return;

      appendUserBubble(text);
      input.value = '';

      if (/(gantt|timeline|jadwal kegiatan|peta waktu)/i.test(text)) {
        setTimeout(() => {
          appendRichGanttBubble();
        }, 500);
        return;
      }

      const container = document.getElementById('chat-messages-container');
      const typingId = 'typing-' + Date.now();
      container.innerHTML += \`
        <div id="\${typingId}" class="flex items-center gap-1.5 text-[10px] font-mono text-lime animate-pulse">
          <span class="material-symbols-outlined text-[14px]">smart_toy</span> Butler sedang memproses analisis...
        </div>
      \`;
      scrollChatToBottom();

      try {
        const res = await fetch(\`\${API_BASE}/api/chat\`, {
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
        appendButlerBubble('⚠️ Gagal terhubung ke server AI. Memeriksa koneksi jaringan.');
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
          <div class="bg-tosca-dark text-white rounded-xl rounded-tr-sm px-3 py-2 max-w-[88%] shadow-md border border-tosca/40 font-body text-xs">
            <p class="leading-relaxed">\${escapeHtml(text)}</p>
            <span class="text-[8px] font-mono opacity-70 block text-right mt-0.5">\${new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}</span>
          </div>
        </div>
      \`;
      scrollChatToBottom();
    }

    function appendButlerBubble(text) {
      const container = document.getElementById('chat-messages-container');
      const formatted = text.replace(/\\n/g, '<br/>').replace(/\\*\\*(.*?)\\*\\*/g, '<b>$1</b>');
      container.innerHTML += \`
        <div class="flex items-start gap-2">
          <div class="w-7 h-7 rounded-full bg-surface-elevated flex items-center justify-center border border-primary/40 text-primary shrink-0 mt-0.5">
            <span class="material-symbols-outlined text-[16px]">smart_toy</span>
          </div>
          <div class="bg-surface rounded-xl rounded-tl-sm p-3 max-w-[92%] border border-border shadow-lg space-y-1.5 text-text-primary text-[11px] leading-relaxed">
            <div>\${formatted}</div>
            <span class="text-[8px] font-mono text-text-secondary block text-right">\${new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}</span>
          </div>
        </div>
      \`;
      scrollChatToBottom();
    }

    function appendRichGanttBubble() {
      const container = document.getElementById('chat-messages-container');
      container.innerHTML += \`
        <div class="flex items-start gap-2">
          <div class="w-7 h-7 rounded-full bg-surface-elevated flex items-center justify-center border border-primary/40 text-primary shrink-0 mt-0.5">
            <span class="material-symbols-outlined text-[16px]">smart_toy</span>
          </div>
          <div class="bg-surface rounded-xl rounded-tl-sm p-3 max-w-[94%] border border-border shadow-lg space-y-2.5 text-text-primary text-[11px] w-full">
            <p class="font-bold text-lime flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">calendar_view_month</span> Visual Gantt Chart Agenda & Target Anda:
            </p>
            
            <div class="bg-background rounded-lg p-2.5 border border-border space-y-2 font-mono text-[9px] overflow-x-auto hide-scrollbar">
              <div class="min-w-[320px] space-y-2">
                <div class="space-y-0.5">
                  <div class="flex justify-between text-text-primary">
                    <span class="font-bold">🏔️ Trip ke Dieng</span>
                    <span class="text-tosca">29-30 Ags (50% Prep)</span>
                  </div>
                  <div class="h-4 bg-surface-elevated rounded overflow-hidden relative">
                    <div class="absolute left-[70%] right-[5%] top-0.5 bottom-0.5 bg-tosca rounded flex items-center justify-center font-bold text-black text-[8px]">
                      2 Hari
                    </div>
                  </div>
                </div>

                <div class="space-y-0.5">
                  <div class="flex justify-between text-text-primary">
                    <span class="font-bold">🛵 Narik Gojek Rutin</span>
                    <span class="text-amber">1-31 Ags (Aktif Harian)</span>
                  </div>
                  <div class="h-4 bg-surface-elevated rounded overflow-hidden relative">
                    <div class="absolute left-[5%] right-[5%] top-0.5 bottom-0.5 bg-amber/40 border border-amber rounded flex items-center px-1 text-amber text-[8px]">
                      Shift Siang & Malam
                    </div>
                  </div>
                </div>

                <div class="space-y-0.5">
                  <div class="flex justify-between text-text-primary">
                    <span class="font-bold">🎓 Wisuda Telkom Univ</span>
                    <span class="text-emerald">12 Ags (100% Selesai)</span>
                  </div>
                  <div class="h-4 bg-surface-elevated rounded overflow-hidden relative">
                    <div class="absolute left-[35%] right-[55%] top-0.5 bottom-0.5 bg-emerald rounded flex items-center justify-center text-black font-bold text-[8px]">
                      Selesai
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p class="text-[10px] text-text-secondary">
              💡 Seluruh timeline kegiatan otomatis tersinkronisasi dengan database aktivitas dan rencana tabungan Anda, Mas Firman.
            </p>
            <span class="text-[8px] font-mono text-text-secondary block text-right">\${new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}</span>
          </div>
        </div>
      \`;
      scrollChatToBottom();
    }

    // --- REAL GPS WEATHER FETCHING ---
    function fetchRealGpsWeather() {
      if (!navigator.geolocation) {
        updateWeatherUI(26, 'Kota Malang', 'Cerah Berawan', 'Kondisi ideal narik Gojek.');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            const wRes = await fetch(\`https://api.open-meteo.com/v1/forecast?latitude=\${lat}&longitude=\${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m\`);
            const wData = await wRes.json();
            const temp = Math.round(wData.current?.temperature_2m || 26);
            const wind = Math.round(wData.current?.wind_speed_10m || 10);
            const wCode = wData.current?.weather_code || 0;

            let desc = "Cerah";
            if (wCode >= 1 && wCode <= 3) desc = "Cerah Berawan";
            else if (wCode >= 51 && wCode <= 67) desc = "Hujan Ringan";
            else if (wCode >= 80) desc = "Hujan Deras";

            let city = "Kota Malang";
            try {
              const geoRes = await fetch(\`https://nominatim.openstreetmap.org/reverse?lat=\${lat}&lon=\${lon}&format=json\`);
              const geoData = await geoRes.json();
              city = geoData.address?.city || geoData.address?.town || geoData.address?.county || geoData.address?.state_district || "Kota Malang";
            } catch (e) {
              city = "Kota Malang";
            }

            let advice = "Kondisi jalanan kering & ideal untuk narik Gojek.";
            if (wCode >= 51) advice = "⚠️ Waspada jalanan licin saat narik Gojek. Bawa jas hujan.";

            updateWeatherUI(temp, city, \`\${desc} • Angin \${wind} km/jam\`, advice);
          } catch (err) {
            updateWeatherUI(26, 'Kota Malang', 'Cerah Berawan', 'Kondisi ideal narik Gojek.');
          }
        },
        () => {
          updateWeatherUI(26, 'Kota Malang', 'Cerah Berawan', 'Kondisi ideal narik Gojek.');
        },
        { timeout: 8000 }
      );
    }

    function updateWeatherUI(temp, city, desc, advice) {
      const elHeader = document.getElementById('header-location');
      const elTemp = document.getElementById('weather-temp');
      const elCity = document.getElementById('weather-city');
      const elDesc = document.getElementById('weather-desc');
      const elAdvice = document.getElementById('weather-advice');

      if (elHeader) elHeader.innerHTML = \`<span class="w-1.5 h-1.5 rounded-full bg-lime inline-block"></span> \${city.toUpperCase()} (\${temp}°C)\`;
      if (elTemp) elTemp.textContent = \`\${temp}°C\`;
      if (elCity) elCity.textContent = city;
      if (elDesc) elDesc.textContent = desc;
      if (elAdvice) elAdvice.innerHTML = \`<span class="material-symbols-outlined text-[14px]">check_circle</span> \${advice}\`;
    }

    async function loadLedgerData() {
      const c = document.getElementById('ledger-list-container');
      if (!c) return;
      c.innerHTML = '<div class="p-3 text-center font-mono text-[10px] text-text-secondary">Memuat data transaksi live...</div>';
      try {
        const res = await fetch(\`\${API_BASE}/api/mobile/crud?userId=\${USER_ID}\`);
        const d = await res.json();
        cachedTransactions = d.transactions || [];
        renderTransactions(cachedTransactions);
      } catch (err) {
        c.innerHTML = '<div class="p-3 text-center font-mono text-[10px] text-coral">Gagal memuat transaksi.</div>';
      }
    }

    function renderTransactions(txs) {
      const c = document.getElementById('ledger-list-container');
      if (!c) return;
      if (txs.length === 0) {
        c.innerHTML = '<div class="p-3 text-center font-mono text-[10px] text-text-secondary">Belum ada transaksi.</div>';
        return;
      }
      c.innerHTML = txs.map(t => \`
        <div class="bg-surface p-2.5 rounded-lg border border-border flex justify-between items-center font-mono text-xs">
          <div class="flex-1 pr-2">
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] font-bold text-primary">\${t.id ? t.id.substring(0, 8) : 'TX'}</span>
              <span class="text-[9px] text-text-secondary">\${t.occurred_at ? t.occurred_at.split('T')[0] : ''}</span>
              <span class="text-[9px] px-1 rounded bg-surface-elevated text-text-secondary">\${t.payment_method || 'Cash'}</span>
            </div>
            <p class="text-[11px] text-text-primary font-body mt-0.5">\${t.description || t.merchant || 'Transaksi'}</p>
          </div>
          <div class="text-right shrink-0">
            <span class="font-bold block \${t.type==='income'?'text-emerald':'text-coral'}">
              \${t.type==='income'?'+':'-'}Rp \${Number(t.amount||0).toLocaleString('id-ID')}
            </span>
            <button onclick="deleteTransaction('\${t.id}')" class="text-[9px] text-coral hover:underline mt-0.5">Hapus</button>
          </div>
        </div>
      \`).join('');
    }

    function filterWallet(walletName) {
      if (walletName === 'all') {
        renderTransactions(cachedTransactions);
      } else {
        const filtered = cachedTransactions.filter(t => (t.payment_method || '').toLowerCase().includes(walletName.toLowerCase()));
        renderTransactions(filtered);
      }
    }

    function openAddModal() {
      document.getElementById('modal-add').classList.add('active');
    }

    function closeModal() {
      document.getElementById('modal-add').classList.remove('active');
    }

    async function submitNewData() {
      const amount = document.getElementById('modal-tx-amount').value;
      const type = document.getElementById('modal-tx-type').value;
      const payment_method = document.getElementById('modal-tx-wallet').value;
      const description = document.getElementById('modal-tx-desc').value;

      if (!amount) {
        alert('Mohon isi nominal uang!');
        return;
      }

      closeModal();
      try {
        await fetch(\`\${API_BASE}/api/mobile/crud\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_transaction',
            payload: {
              user_id: USER_ID,
              amount: Number(amount),
              type,
              payment_method,
              description: description || 'Input Cepat Mobile'
            }
          })
        });
        loadLedgerData();
      } catch (err) {
        alert('Gagal menyimpan data.');
      }
    }

    async function deleteTransaction(id) {
      if (!confirm('Yakin ingin menghapus transaksi ini?')) return;
      try {
        await fetch(\`\${API_BASE}/api/mobile/crud\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete_transaction',
            payload: { id }
          })
        });
        loadLedgerData();
      } catch (err) {
        alert('Gagal menghapus data.');
      }
    }

    function startVoiceSTT() {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Fitur Voice STT membutuhkan mikrofon.');
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

    window.onload = () => {
      switchTab('chat');
      fetchRealGpsWeather();
    };
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
