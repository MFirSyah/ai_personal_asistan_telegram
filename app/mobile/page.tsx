'use client';

import React from 'react';

const HTML_SOURCE = `<!DOCTYPE html>
<html lang="id" class="dark">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"/>
  <title>Raphael</title>
  <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
  <script src="chart.min.js"></script>
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
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      touch-action: manipulation;
      -webkit-touch-callout: none !important;
      -webkit-user-select: none !important;
      user-select: none !important;
    }
    input, textarea {
      -webkit-user-select: text !important;
      user-select: text !important;
    }
    html, body {
      background-color: #0B0F12;
      color: #F8FAFC;
      font-family: 'Inter', sans-serif;
      -webkit-tap-highlight-color: transparent;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    button, a { cursor: pointer; -webkit-tap-highlight-color: rgba(0,0,0,0); }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    .glass-panel {
      background: #141A20;
      border: 1px solid rgba(40, 50, 62, 0.85);
    }
    .tosca-bloom { box-shadow: 0 0 12px rgba(0, 168, 168, 0.3); }
    .lime-glow { box-shadow: 0 0 14px rgba(210, 240, 0, 0.4); }
    .coral-pulse {
      animation: pulseCoral 1s infinite alternate;
    }
    @keyframes pulseCoral {
      from { box-shadow: 0 0 8px rgba(239, 68, 68, 0.4); transform: scale(1); }
      to { box-shadow: 0 0 20px rgba(239, 68, 68, 0.9); transform: scale(1.08); }
    }
    
    .tab-pane {
      display: none;
      width: 100%;
      height: 100%;
      overflow-y: auto;
      padding-bottom: 68px !important;
      -webkit-overflow-scrolling: touch;
    }
    #tab-chat {
      padding-bottom: 164px !important;
    }
    
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.85);
      z-index: 100;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .modal-overlay.active { display: flex; animation: fadeIn 0.15s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    #toast-notification {
      display: none;
      position: fixed;
      top: 60px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 150;
      animation: toastIn 0.2s ease-out;
    }
    @keyframes toastIn {
      from { opacity: 0; transform: translate(-50%, -10px); }
      to { opacity: 1; transform: translate(-50%, 0); }
    }
  </style>
</head>
<body class="flex flex-col h-full w-full text-xs" oncontextmenu="return false;">

  <!-- Floating Toast Notification -->
  <div id="toast-notification" class="bg-surface-elevated border border-lime text-lime px-3.5 py-1.5 rounded-full font-mono text-[10px] font-bold shadow-2xl flex items-center gap-1.5">
    <span class="material-symbols-outlined text-[14px]">check_circle</span>
    <span id="toast-message">Notifikasi Berhasil</span>
  </div>

  <!-- ========================================================================= -->
  <!-- 🔝 TOP APP BAR (HEADER RAPHAEL) -->
  <!-- ========================================================================= -->
  <header class="glass-panel px-3.5 py-2.5 flex justify-between items-center border-b border-border/50 shrink-0 z-40">
    <div class="flex items-center gap-2">
      <!-- Interactive Robot Icon -> Opens AI Settings Modal -->
      <button onclick="openAiSettingsModal()" class="relative active:scale-95 transition-transform">
        <div class="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center border border-primary/40 tosca-bloom">
          <span class="material-symbols-outlined text-primary text-[18px]">smart_toy</span>
        </div>
        <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-lime rounded-full border-2 border-background animate-pulse"></div>
      </button>

      <div>
        <h1 class="font-headline font-bold text-sm leading-tight flex items-center gap-1 text-text-primary">
          Raphael
          <span class="text-[9px] font-mono px-1 rounded bg-primary/20 text-primary border border-primary/30">AI</span>
        </h1>
        <p class="text-[10px] font-mono text-lime flex items-center gap-1" id="header-location">
          <span class="w-1.5 h-1.5 rounded-full bg-lime inline-block"></span> MALANG (26°C)
        </p>
      </div>
    </div>

    <!-- Quick Dynamic Balances Pill -->
    <div class="glass-panel px-2.5 py-1 rounded-full flex items-center gap-2 border border-border/60" id="header-balance-pill">
      <div class="flex items-center gap-1">
        <span class="text-[9px] font-mono text-text-secondary">KAS</span>
        <span class="text-[11px] font-mono font-bold text-lime" id="header-cash">Rp 152k</span>
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
    <!-- 📊 TAB 1: ANALYTICS & TIMELINE GANTT CHART -->
    <!-- ======================================================================= -->
    <div id="tab-analytics" class="tab-pane px-3.5 py-2.5 space-y-2.5">
      <div class="flex justify-between items-center">
        <h2 class="font-headline font-bold text-sm text-text-primary">Analisis Keuangan & Timeline</h2>
        <span class="text-[9px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Realtime</span>
      </div>

      <!-- Health Score Card -->
      <div class="bg-surface rounded-xl p-3 border border-border relative overflow-hidden tosca-bloom">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-[9px] font-mono uppercase tracking-widest text-primary font-bold">Financial Health Score</span>
            <h3 class="text-xl font-mono font-black text-text-primary mt-0.5">88<span class="text-xs text-text-secondary">/100</span></h3>
            <p class="text-[10px] text-text-secondary mt-0.5">Kondisi Keuangan Sangat Sehat & Beban Cicilan Terkendali.</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-surface-elevated border-2 border-primary flex items-center justify-center font-mono font-bold text-lime text-base shrink-0">
            A+
          </div>
        </div>
      </div>

      <!-- 2x2 Metric Grid -->
      <div class="grid grid-cols-2 gap-2 font-mono">
        <div class="bg-surface rounded-xl p-2.5 border border-border">
          <span class="text-[8px] text-text-secondary uppercase">Total Pemasukan</span>
          <p class="text-xs font-bold text-emerald mt-0.5" id="metric-income">Rp 3.450.000</p>
          <span class="text-[8px] text-emerald">▲ +12% vs lalu</span>
        </div>
        <div class="bg-surface rounded-xl p-2.5 border border-border">
          <span class="text-[8px] text-text-secondary uppercase">Total Pengeluaran</span>
          <p class="text-xs font-bold text-coral mt-0.5" id="metric-expense">Rp 2.120.000</p>
          <span class="text-[8px] text-coral">▼ -5% vs lalu</span>
        </div>
        <div class="bg-surface rounded-xl p-2.5 border border-border">
          <span class="text-[8px] text-text-secondary uppercase">Sisa Kas Likuid</span>
          <p class="text-xs font-bold text-tosca mt-0.5" id="metric-liquid">Rp 325.500</p>
          <span class="text-[8px] text-text-secondary">5 Dompet Aktif</span>
        </div>
        <div class="bg-surface rounded-xl p-2.5 border border-border">
          <span class="text-[8px] text-text-secondary uppercase">Daily Burn Rate</span>
          <p class="text-xs font-bold text-lime mt-0.5" id="metric-burn">Rp 68.000<span class="text-[8px] text-text-secondary">/hr</span></p>
          <span class="text-[8px] text-lime">Stabil Normal</span>
        </div>
      </div>

      <!-- GANTT TIMELINE CARD -->
      <div class="bg-surface rounded-xl p-3 border border-border space-y-2 shadow-md">
        <div class="flex justify-between items-center text-[10px] font-mono border-b border-border/50 pb-1.5">
          <span class="font-bold text-text-primary flex items-center gap-1">
            <span class="material-symbols-outlined text-primary text-[14px]">calendar_view_month</span> TIMELINE GANTT 2026
          </span>
          <span class="px-1.5 py-0.5 rounded bg-coral/20 text-coral font-bold text-[9px] flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-coral inline-block"></span> HARI INI (27 AGS)
          </span>
        </div>

        <div class="space-y-2 font-mono text-[10px]">
          <div class="p-2 rounded-lg bg-surface-elevated space-y-1">
            <div class="flex justify-between items-center">
              <span class="font-bold text-text-primary flex items-center gap-1">
                <span class="material-symbols-outlined text-tosca text-[13px]">landscape</span> Trip ke Dieng (22 - 30 Ags)
              </span>
              <span class="text-tosca font-bold text-[9px]">50% Prep (Sisa Rp 740k)</span>
            </div>
            <div class="w-full h-2.5 bg-surface rounded-full overflow-hidden relative">
              <div class="h-full bg-gradient-to-r from-tosca to-primary rounded-full" style="width: 50%"></div>
            </div>
            <div class="flex justify-between text-[8px] text-text-secondary">
              <span>🗓️ 29-30 Agustus (2 Hari Liburan)</span>
              <span>Pagu: Rp 1.040.000</span>
            </div>
          </div>

          <div class="p-2 rounded-lg bg-surface-elevated space-y-1">
            <div class="flex justify-between items-center">
              <span class="font-bold text-text-primary flex items-center gap-1">
                <span class="material-symbols-outlined text-amber text-[13px]">two_wheeler</span> Narik Gojek Rutin Malang
              </span>
              <span class="text-amber font-bold text-[9px]">Aktif Harian (Rp 150k/hr)</span>
            </div>
            <div class="w-full h-2.5 bg-surface rounded-full overflow-hidden relative">
              <div class="h-full bg-amber rounded-full" style="width: 75%"></div>
            </div>
            <div class="flex justify-between text-[8px] text-text-secondary">
              <span>🗓️ 1 - 31 Agustus 2026</span>
              <span>Shift Siang & Malam</span>
            </div>
          </div>

          <div class="p-2 rounded-lg bg-surface-elevated space-y-1">
            <div class="flex justify-between items-center">
              <span class="font-bold text-text-primary flex items-center gap-1">
                <span class="material-symbols-outlined text-emerald text-[13px]">school</span> Wisuda Telkom University
              </span>
              <span class="text-emerald font-bold text-[9px]">100% Sukses Selesai</span>
            </div>
            <div class="w-full h-2.5 bg-surface rounded-full overflow-hidden relative">
              <div class="h-full bg-emerald rounded-full" style="width: 100%"></div>
            </div>
            <div class="flex justify-between text-[8px] text-text-secondary">
              <span>🗓️ 12 Agustus 2026</span>
              <span>Status: Lulus Tepat Waktu</span>
            </div>
          </div>
        </div>
      </div>

      <!-- DYNAMIC GOALS CARD -->
      <div class="bg-surface rounded-xl p-3 border border-border space-y-2">
        <div class="flex justify-between items-center">
          <h4 class="font-headline font-bold text-[9px] uppercase text-text-secondary tracking-wider">Target & Sinking Funds</h4>
          <button onclick="openDynamicHubModal('goals')" class="text-lime text-[9px] font-mono font-bold hover:underline">+ Kelola Target</button>
        </div>
        <div id="dynamic-goals-container" class="space-y-1.5 font-mono text-[10px]"></div>
      </div>

    </div>

    <!-- ======================================================================= -->
    <!-- 🗄️ TAB 2: DATABASE DATA CORE -->
    <!-- ======================================================================= -->
    <div id="tab-data" class="tab-pane px-3.5 py-2.5 space-y-2.5">
      
      <div class="flex bg-surface-elevated p-1 rounded-xl border border-border">
        <button id="data-sub-tx-btn" onclick="switchDataSubTab('tx')" class="flex-1 py-1.5 rounded-lg text-[10px] font-mono font-bold bg-primary text-black transition-all">
          💳 Transaksi Keuangan
        </button>
        <button id="data-sub-act-btn" onclick="switchDataSubTab('act')" class="flex-1 py-1.5 rounded-lg text-[10px] font-mono font-bold text-text-secondary transition-all">
          📋 Agenda & Aktivitas
        </button>
      </div>

      <!-- Sub-view 1: Transaksi Keuangan -->
      <div id="data-sub-tx-view" class="space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-text-primary">Daftar Transaksi Kas</span>
          <div class="flex gap-1">
            <button onclick="openAddTxModal()" class="px-2.5 py-1 bg-lime text-black font-mono font-bold text-[10px] rounded-lg flex items-center gap-1 shadow-md active:scale-95">
              <span class="material-symbols-outlined text-[13px]">add</span> Tambah
            </button>
            <button onclick="exportToExcel()" class="px-2 py-1 bg-primary/20 border border-primary text-primary text-[10px] font-mono font-bold rounded-lg flex items-center gap-1 active:scale-95">
              <span class="material-symbols-outlined text-[11px]">download</span> Excel
            </button>
          </div>
        </div>

        <div id="dynamic-wallet-filter-container" class="flex gap-1.5 overflow-x-auto hide-scrollbar text-[10px] font-mono py-0.5"></div>

        <div id="ledger-list-container" class="space-y-1.5"></div>
      </div>

      <!-- Sub-view 2: Agenda & Aktivitas -->
      <div id="data-sub-act-view" class="space-y-2" style="display: none;">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-text-primary">Daftar Agenda & Kegiatan</span>
          <button onclick="openAddActModal()" class="px-2.5 py-1 bg-lime text-black font-mono font-bold text-[10px] rounded-lg flex items-center gap-1 shadow-md active:scale-95">
            <span class="material-symbols-outlined text-[13px]">add</span> Tambah Agenda
          </button>
        </div>

        <div id="activity-list-container" class="space-y-1.5"></div>
      </div>

    </div>

    <!-- ======================================================================= -->
    <!-- 💬 TAB 3: RAPHAEL AI CHAT HUB (HERO DEFAULT SCREEN) -->
    <!-- ======================================================================= -->
    <div id="tab-chat" class="tab-pane px-3.5 py-2.5 space-y-2.5" style="display: block;">
      
      <div class="text-center my-0.5">
        <span class="text-[9px] font-mono text-text-secondary bg-surface-elevated px-2.5 py-0.5 rounded-full border border-border/50">
          HARI INI, 27 AGUSTUS 2026
        </span>
      </div>

      <!-- Message Stream Container -->
      <div id="chat-messages-container" class="space-y-2.5 w-full">
        
        <!-- Initial Welcome Message -->
        <div class="flex items-start gap-2" id="welcome-message-bubble">
          <div class="w-7 h-7 rounded-full bg-surface-elevated flex items-center justify-center border border-primary/40 text-primary shrink-0 mt-0.5">
            <span class="material-symbols-outlined text-[16px]">smart_toy</span>
          </div>
          <div class="bg-surface rounded-xl rounded-tl-sm p-3 max-w-[92%] border border-border shadow-lg space-y-2 text-text-primary text-[11px] leading-relaxed">
            <p>
              Selamat datang, <b>Mas Firman</b>. Asisten <b>Raphael</b> siap mendampingi pencatatan keuangan, split bill WhatsApp, simulasi pelunasan Bank Jago, cek checklist Dieng/skripsi, logbook motor aktif, dan analisis visual Anda.
            </p>

            <!-- Dieng Progress Card Widget -->
            <div class="bg-background rounded-lg p-2.5 border-l-2 border-primary space-y-1 font-mono text-[10px]">
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

            <!-- Active Motorcycle Widget -->
            <div class="bg-background rounded-lg p-2 border border-border flex items-center justify-between" id="active-vehicle-chat-widget">
              <div class="flex items-center gap-2">
                <div class="p-1.5 rounded bg-surface-elevated text-lime">
                  <span class="material-symbols-outlined text-[14px]">two_wheeler</span>
                </div>
                <div class="font-mono text-[9px]">
                  <p class="font-bold text-text-primary" id="widget-vehicle-name">Honda Beat FI (N 4567 XX)</p>
                  <p class="text-text-secondary" id="widget-vehicle-eff">Konsumsi: ~50.2 KM/L (Pertalite) • Odometer: 32.500 KM</p>
                </div>
              </div>
              <button onclick="openDynamicHubModal('vehicles')" class="text-[9px] text-tosca font-mono font-bold hover:underline">Ganti</button>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- ======================================================================= -->
    <!-- 🔔 TAB 4: NOTIFICATIONS & SMART ALERTS -->
    <!-- ======================================================================= -->
    <div id="tab-notifications" class="tab-pane px-3.5 py-2.5 space-y-2.5">
      <div class="flex justify-between items-center">
        <h2 class="font-headline font-bold text-sm text-text-primary">Pusat Notifikasi & Pengingat</h2>
        <button onclick="openDynamicHubModal('bills')" class="text-lime text-[9px] font-mono font-bold hover:underline">+ Kelola Tagihan</button>
      </div>

      <!-- Live GPS Weather Card -->
      <div class="bg-surface rounded-xl p-3 border-l-4 border-tosca border border-border space-y-1.5 shadow-md">
        <div class="flex justify-between items-center">
          <span class="text-[10px] font-mono font-bold text-tosca flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px]">near_me</span> CUACA REALTIME LOKASI ANDA
          </span>
          <span class="text-[8px] font-mono text-lime font-bold" id="weather-badge">GPS LIVE</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-2xl font-mono font-bold text-text-primary" id="weather-temp">26°C</span>
          <div>
            <h3 class="font-bold text-xs text-text-primary" id="weather-city">Kota Malang, Jawa Timur</h3>
            <p class="text-[10px] text-text-secondary" id="weather-desc">Cerah Berawan • Angin 9 km/jam</p>
          </div>
        </div>
        <div class="p-1.5 rounded bg-surface-elevated font-mono text-[9px] text-lime flex items-center gap-1" id="weather-advice">
          <span class="material-symbols-outlined text-[13px]">check_circle</span> Kondisi jalanan kering & ideal untuk narik Gojek sore/malam ini.
        </div>
      </div>

      <div id="dynamic-bills-container" class="space-y-2"></div>

    </div>

    <!-- ======================================================================= -->
    <!-- ⚙️ TAB 5: PROFILE, DYNAMIC HUB, RINGKASAN SOS & SETTINGS -->
    <!-- ======================================================================= -->
    <div id="tab-profile" class="tab-pane px-3.5 py-2.5 space-y-2.5">
      <h2 class="font-headline font-bold text-sm text-text-primary">Profil & Pengaturan Sistem</h2>

      <!-- User Badge -->
      <div class="bg-surface rounded-xl p-3 border border-border flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary font-bold text-sm shrink-0">
            MF
          </div>
          <div>
            <h3 class="font-headline font-bold text-xs text-text-primary">Mas Firman</h3>
            <p class="text-[9px] font-mono text-primary flex items-center gap-1">
              <span class="material-symbols-outlined text-[11px]">verified</span> Verified User (ID: 1084842050)
            </p>
          </div>
        </div>
        <button onclick="openAiSettingsModal()" class="px-2.5 py-1 bg-primary/20 border border-primary rounded-lg text-primary text-[10px] font-mono font-bold flex items-center gap-1 active:scale-95">
          <span class="material-symbols-outlined text-[13px]">tune</span> Setting AI
        </button>
      </div>

      <!-- MASTER DYNAMIC HUB CARD -->
      <div class="bg-surface rounded-xl p-3 border-2 border-primary/40 tosca-bloom space-y-2">
        <div class="flex justify-between items-center">
          <span class="font-headline font-bold text-xs text-text-primary flex items-center gap-1.5">
            <span class="material-symbols-outlined text-lime text-[16px]">widgets</span> KELOLA ENTITAS DINAMIS
          </span>
          <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-lime/20 text-lime font-bold">5 MODUL</span>
        </div>
        <p class="text-[10px] text-text-secondary leading-relaxed">
          Atur dompet, armada motor, target menabung, tagihan, dan tombol pintasan chat secara mandiri kapan saja.
        </p>
        <button onclick="openDynamicHubModal('wallets')" class="w-full py-2 bg-gradient-to-r from-primary to-tosca text-black font-bold rounded-lg text-xs font-mono shadow flex items-center justify-center gap-1.5 active:scale-95">
          <span class="material-symbols-outlined text-[15px]">tune</span> Buka Dynamic Hub Manager
        </button>
      </div>

      <!-- RINGKASAN EMERGENCY ICE PROFILE CARD (SUPER RAPI & RINGKAS) -->
      <div class="bg-surface rounded-xl p-3 border-l-4 border-coral border border-border space-y-2 font-mono text-xs">
        <div class="flex justify-between items-center">
          <span class="font-bold text-coral flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">medical_services</span> PROFIL DARURAT (SOS / ICE)
          </span>
          <button onclick="openEditIceModal()" class="px-2 py-1 bg-coral/20 border border-coral text-coral rounded text-[9px] font-bold flex items-center gap-1 active:scale-95">
            <span class="material-symbols-outlined text-[12px]">edit</span> Atur Data
          </button>
        </div>
        
        <!-- Compact Summary Row -->
        <div class="p-2 rounded-lg bg-surface-elevated border border-border space-y-1 text-[10px]">
          <div class="flex justify-between">
            <span class="text-text-secondary">Gol. Darah: <b class="text-coral" id="ice-summary-blood">O (Positif)</b></span>
            <span class="text-text-secondary">BPJS: <b class="text-text-primary" id="ice-summary-bpjs">0001234567890</b></span>
          </div>
          <div class="flex justify-between text-[9px]">
            <span class="text-text-secondary truncate max-w-[180px]">Kontak: <b class="text-lime" id="ice-summary-contact">Ibu (0812-3456-7890)</b></span>
            <span class="text-text-secondary">Status: <b class="text-emerald">Lengkap</b></span>
          </div>
        </div>

        <p class="text-[8px] text-text-secondary flex items-center gap-1">
          <span class="material-symbols-outlined text-[12px] text-coral">info</span> Tahan ikon robot di navbar 3 detik atau ketik "sos" di chat untuk memunculkan modal darurat.
        </p>
      </div>

      <!-- Dynamic Wallet Balances Overview -->
      <div class="bg-surface rounded-xl p-3 border border-border space-y-1.5 font-mono text-[10px]">
        <div class="flex justify-between items-center border-b border-border/50 pb-1">
          <span class="font-bold text-text-secondary uppercase text-[9px] tracking-wider">Status Dompet Terhubung</span>
          <button onclick="openDynamicHubModal('wallets')" class="text-lime text-[9px] hover:underline">+ Atur Dompet</button>
        </div>
        <div id="dynamic-wallets-list" class="space-y-1"></div>
      </div>

    </div>

  </main>

  <!-- ========================================================================= -->
  <!-- 💬 CHAT INPUT DOCK (NO TTS / STT) -->
  <!-- ========================================================================= -->
  <div id="chat-input-wrapper" class="fixed bottom-[68px] left-0 right-0 z-30 px-3 max-w-lg mx-auto space-y-1.5">
    
    <!-- Dynamic Quick Action Pills -->
    <div id="dynamic-pills-container" class="flex gap-1.5 overflow-x-auto hide-scrollbar py-0.5"></div>

    <!-- Floating Input Bar -->
    <div class="glass-panel rounded-full p-1 pl-2.5 pr-1 flex items-center gap-1 border border-border focus-within:border-primary tosca-bloom">
      <input id="receipt-file-input" type="file" accept="image/*" class="hidden" onchange="handleReceiptSelected(event)"/>
      
      <button onclick="triggerReceiptUpload()" class="text-text-secondary hover:text-tosca p-1 active:scale-95 transition-colors" title="Foto Struk Belanja">
        <span class="material-symbols-outlined text-[18px]">add_a_photo</span>
      </button>

      <input id="chat-input-text" type="text" placeholder="Tanya Raphael, split bill, cek checklist, atau ketik 'sos'..." class="flex-1 bg-transparent border-none focus:ring-0 text-[11px] font-body text-text-primary placeholder:text-text-secondary/50 h-8 outline-none px-1" onkeydown="if(event.key==='Enter') sendMessage()"/>
      
      <button onclick="sendMessage()" class="w-8 h-8 rounded-full bg-lime text-black flex items-center justify-center font-bold active:scale-95 transition-transform lime-glow shrink-0">
        <span class="material-symbols-outlined text-[16px]">send</span>
      </button>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- 🧭 SOLID DOCKED BOTTOM NAVIGATION BAR (ROBOT ICON LONG-PRESS 3S SOS) -->
  <!-- ========================================================================= -->
  <nav class="fixed bottom-0 left-0 right-0 w-full h-14 bg-surface border-t border-border/80 shadow-2xl z-50 flex justify-around items-center px-2" oncontextmenu="return false;">
    
    <button onclick="switchTab('analytics')" id="nav-btn-analytics" class="p-2 text-text-secondary hover:text-primary transition-colors flex flex-col items-center active:scale-90 select-none">
      <span class="material-symbols-outlined text-[20px]">analytics</span>
    </button>

    <button onclick="switchTab('data')" id="nav-btn-data" class="p-2 text-text-secondary hover:text-primary transition-colors flex flex-col items-center active:scale-90 select-none">
      <span class="material-symbols-outlined text-[20px]">storage</span>
    </button>

    <!-- Center Robot Button: Tap to Switch Chat, Hold 3 Seconds to Trigger SOS -->
    <div class="relative flex items-center justify-center select-none" oncontextmenu="return false;">
      <button id="nav-btn-chat" class="w-10 h-10 rounded-full bg-lime text-black flex items-center justify-center lime-glow border-2 border-background shadow-lg transition-transform active:scale-95 select-none" oncontextmenu="return false;">
        <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">smart_toy</span>
      </button>
    </div>

    <button onclick="switchTab('notifications')" id="nav-btn-notifications" class="p-2 text-text-secondary hover:text-primary transition-colors flex flex-col items-center active:scale-90 select-none">
      <span class="material-symbols-outlined text-[20px]">notifications</span>
    </button>

    <button onclick="switchTab('profile')" id="nav-btn-profile" class="p-2 text-text-secondary hover:text-primary transition-colors flex flex-col items-center active:scale-90 select-none">
      <span class="material-symbols-outlined text-[20px]">settings</span>
    </button>

  </nav>

  <!-- ========================================================================= -->
  <!-- 🚨 EMERGENCY ICE MODAL (PROFIL MEDIS & KONTAK DARURAT) -->
  <!-- ========================================================================= -->
  <div id="modal-emergency" class="modal-overlay">
    <div class="bg-surface border-2 border-coral rounded-2xl p-4 w-full max-w-sm space-y-3 font-mono">
      <div class="flex justify-between items-center border-b border-border/50 pb-2">
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-coral text-[20px]">medical_services</span>
          <h3 class="font-headline font-bold text-sm text-coral">EMERGENCY ICE PROFILE</h3>
        </div>
        <button onclick="closeEmergencyModal()" class="text-text-secondary hover:text-text-primary text-sm font-bold active:scale-90">✕</button>
      </div>

      <div class="space-y-2 text-xs">
        <div class="p-2.5 rounded-lg bg-surface-elevated border border-border space-y-1">
          <p class="text-text-secondary text-[10px] uppercase font-bold">Identitas Rider</p>
          <p class="font-bold text-text-primary text-sm" id="ice-modal-name">Mas Firman (M. Firman Syah)</p>
          <p class="text-tosca text-[10px]" id="ice-modal-city">Kota Malang, Jawa Timur</p>
        </div>

        <div class="grid grid-cols-2 gap-2 text-[10px]">
          <div class="p-2 rounded bg-surface-elevated border border-border">
            <span class="text-text-secondary uppercase text-[8px]">Golongan Darah</span>
            <p class="font-bold text-coral text-base mt-0.5" id="ice-modal-blood">O (Positif)</p>
          </div>
          <div class="p-2 rounded bg-surface-elevated border border-border">
            <span class="text-text-secondary uppercase text-[8px]">Motor Aktif</span>
            <p class="font-bold text-lime text-xs mt-0.5" id="ice-modal-vehicle">Honda Beat FI</p>
          </div>
        </div>

        <div class="p-2.5 rounded-lg bg-surface-elevated border border-border space-y-1">
          <p class="text-text-secondary text-[10px] uppercase font-bold">Kontak Darurat Keluarga</p>
          <p class="font-bold text-text-primary text-xs" id="ice-modal-contact">Ibu / Keluarga: 0812-3456-7890</p>
          <p class="text-text-secondary text-[9px]">Hubungi segera jika terjadi insiden / kecelakaan jalan raya.</p>
        </div>

        <div class="p-2 rounded bg-background border border-border text-[9px] text-text-secondary space-y-0.5">
          <p>• BPJS / Asuransi: <b class="text-text-primary" id="ice-modal-bpjs">0001234567890</b></p>
          <p>• Catatan Medis: <span class="text-lime" id="ice-modal-notes">Tidak ada alergi obat berat.</span></p>
        </div>
      </div>

      <div class="flex gap-2">
        <button onclick="openEditIceModal(); closeEmergencyModal();" class="flex-1 py-2 bg-surface-elevated border border-coral text-coral font-bold rounded-lg text-xs active:scale-95">Edit Profil ICE</button>
        <button onclick="closeEmergencyModal()" class="flex-1 py-2 bg-coral text-white font-bold rounded-lg text-xs shadow-md active:scale-95">Tutup</button>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- ✏️ MODAL EDIT PENGATURAN DARURAT (DIBUKA SAAT DIKETUK DARI PROFIL) -->
  <!-- ========================================================================= -->
  <div id="modal-edit-ice" class="modal-overlay">
    <div class="bg-surface border-2 border-coral rounded-2xl p-4 w-full max-w-sm space-y-3 font-mono max-h-[90vh] overflow-y-auto hide-scrollbar">
      <div class="flex justify-between items-center border-b border-border/50 pb-2">
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-coral text-[18px]">medical_services</span>
          <h3 class="font-headline font-bold text-sm text-coral">Atur Profil Darurat (ICE)</h3>
        </div>
        <button onclick="closeEditIceModal()" class="text-text-secondary hover:text-text-primary text-sm font-bold active:scale-90">✕</button>
      </div>

      <div class="space-y-2 text-[10px]">
        <div>
          <label class="text-[8px] text-text-secondary uppercase">Nama Lengkap & Domisili</label>
          <input id="ice-name-input" type="text" value="Mas Firman (M. Firman Syah)" class="w-full bg-surface-elevated border border-border rounded p-1.5 text-text-primary text-xs outline-none mt-0.5"/>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-[8px] text-text-secondary uppercase">Golongan Darah</label>
            <input id="ice-blood-input" type="text" value="O (Positif)" class="w-full bg-surface-elevated border border-border rounded p-1.5 text-text-primary text-xs outline-none mt-0.5"/>
          </div>
          <div>
            <label class="text-[8px] text-text-secondary uppercase">Nomor BPJS / Asuransi</label>
            <input id="ice-bpjs-input" type="text" value="0001234567890" class="w-full bg-surface-elevated border border-border rounded p-1.5 text-text-primary text-xs outline-none mt-0.5"/>
          </div>
        </div>
        <div>
          <label class="text-[8px] text-text-secondary uppercase">Kontak Darurat Keluarga (Nama & No HP)</label>
          <input id="ice-contact-input" type="text" value="Ibu / Keluarga: 0812-3456-7890" class="w-full bg-surface-elevated border border-border rounded p-1.5 text-text-primary text-xs outline-none mt-0.5"/>
        </div>
        <div>
          <label class="text-[8px] text-text-secondary uppercase">Catatan Medis Khusus / Alergi</label>
          <input id="ice-notes-input" type="text" value="Tidak ada riwayat alergi obat berat." class="w-full bg-surface-elevated border border-border rounded p-1.5 text-text-primary text-xs outline-none mt-0.5"/>
        </div>
      </div>

      <div class="flex gap-2 pt-1">
        <button onclick="closeEditIceModal()" class="flex-1 py-2 bg-surface-elevated text-text-secondary font-bold rounded-lg border border-border text-xs active:scale-95">Batal</button>
        <button onclick="saveEmergencyProfileFromModal()" class="flex-1 py-2 bg-coral text-white font-bold rounded-lg text-xs shadow-md active:scale-95">Simpan Data</button>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- 🎛️ MASTER MODAL: KELOLA ENTITAS DINAMIS -->
  <!-- ========================================================================= -->
  <div id="modal-dynamic-hub" class="modal-overlay">
    <div class="bg-surface border border-border rounded-2xl p-4 w-full max-w-sm space-y-3 font-mono max-h-[90vh] overflow-y-auto hide-scrollbar">
      <div class="flex justify-between items-center border-b border-border/50 pb-2">
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-lime text-[18px]">tune</span>
          <h3 class="font-headline font-bold text-sm text-text-primary">Dynamic Entities Hub</h3>
        </div>
        <button onclick="closeDynamicHubModal()" class="text-text-secondary hover:text-text-primary text-sm font-bold active:scale-90">✕</button>
      </div>

      <!-- 5 Dynamic Sub-Tabs Including Vehicles -->
      <div class="flex gap-1 overflow-x-auto hide-scrollbar bg-surface-elevated p-1 rounded-xl border border-border text-[9px] font-mono font-bold">
        <button id="dh-tab-wallets-btn" onclick="switchDynamicHubTab('wallets')" class="px-2.5 py-1.5 rounded-lg bg-primary text-black shrink-0">💳 Dompet</button>
        <button id="dh-tab-vehicles-btn" onclick="switchDynamicHubTab('vehicles')" class="px-2.5 py-1.5 rounded-lg text-text-secondary shrink-0">🛵 Motor</button>
        <button id="dh-tab-goals-btn" onclick="switchDynamicHubTab('goals')" class="px-2.5 py-1.5 rounded-lg text-text-secondary shrink-0">🎯 Target</button>
        <button id="dh-tab-bills-btn" onclick="switchDynamicHubTab('bills')" class="px-2.5 py-1.5 rounded-lg text-text-secondary shrink-0">💳 Tagihan</button>
        <button id="dh-tab-pills-btn" onclick="switchDynamicHubTab('pills')" class="px-2.5 py-1.5 rounded-lg text-text-secondary shrink-0">⚡ Pintasan</button>
      </div>

      <!-- Sub-Tab 1: Wallets -->
      <div id="dh-view-wallets" class="space-y-2.5">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-text-primary">Daftar Dompet Aktif</span>
          <button onclick="openAddWalletModal()" class="px-2 py-1 bg-lime text-black rounded text-[9px] font-bold">+ Tambah</button>
        </div>
        <div id="dh-wallets-list-container" class="space-y-1.5"></div>
      </div>

      <!-- Sub-Tab 2: Vehicles (Multi-Motorcycle Fleet) -->
      <div id="dh-view-vehicles" class="space-y-2.5" style="display: none;">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-text-primary">Armada Motor Mas Firman</span>
          <button onclick="openAddVehicleModal()" class="px-2 py-1 bg-lime text-black rounded text-[9px] font-bold">+ Tambah Motor</button>
        </div>
        <p class="text-[9px] text-text-secondary">Pilih motor aktif untuk narik Gojek / harian agar kalkulasi bensin & odometer akurat:</p>
        <div id="dh-vehicles-list-container" class="space-y-1.5"></div>
      </div>

      <!-- Sub-Tab 3: Goals -->
      <div id="dh-view-goals" class="space-y-2.5" style="display: none;">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-text-primary">Target Menabung & Sinking Fund</span>
          <button onclick="openAddGoalModal()" class="px-2 py-1 bg-lime text-black rounded text-[9px] font-bold">+ Target Baru</button>
        </div>
        <div id="dh-goals-list-container" class="space-y-1.5"></div>
      </div>

      <!-- Sub-Tab 4: Bills -->
      <div id="dh-view-bills" class="space-y-2.5" style="display: none;">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-text-primary">Daftar Tagihan & Cicilan</span>
          <button onclick="openAddBillModal()" class="px-2 py-1 bg-lime text-black rounded text-[9px] font-bold">+ Tagihan Baru</button>
        </div>
        <div id="dh-bills-list-container" class="space-y-1.5"></div>
      </div>

      <!-- Sub-Tab 5: Pills -->
      <div id="dh-view-pills" class="space-y-2.5" style="display: none;">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-text-primary">Tombol Pintasan Chat Cepat</span>
          <button onclick="openAddPillModal()" class="px-2 py-1 bg-lime text-black rounded text-[9px] font-bold">+ Pintasan Baru</button>
        </div>
        <div id="dh-pills-list-container" class="space-y-1.5"></div>
      </div>

    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- 🤖 MODAL DIALOG: PENGATURAN PREFERENSI AI -->
  <!-- ========================================================================= -->
  <div id="modal-ai-settings" class="modal-overlay">
    <div class="bg-surface border border-border rounded-2xl p-4 w-full max-w-sm space-y-3 font-mono max-h-[90vh] overflow-y-auto hide-scrollbar">
      <div class="flex justify-between items-center border-b border-border/50 pb-2">
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-primary text-[18px]">tune</span>
          <h3 class="font-headline font-bold text-sm text-text-primary">Pengaturan Preferensi Raphael</h3>
        </div>
        <button onclick="closeAiSettingsModal()" class="text-text-secondary hover:text-text-primary text-sm font-bold active:scale-90">✕</button>
      </div>

      <div class="flex bg-surface-elevated p-1 rounded-xl border border-border">
        <button id="ai-mode-desc-btn" onclick="switchAiMode('desc')" class="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-primary text-black transition-all">
          📝 Deskripsi Bebas
        </button>
        <button id="ai-mode-bullet-btn" onclick="switchAiMode('bullet')" class="flex-1 py-1.5 rounded-lg text-[10px] font-bold text-text-secondary transition-all">
          • Bullet Points
        </button>
      </div>

      <div id="ai-mode-desc-view" class="space-y-1.5">
        <label class="text-[10px] text-text-secondary uppercase">Instruksi Deskripsi Personal</label>
        <textarea id="ai-pref-desc-input" rows="4" placeholder="Instruksi naratif personal Mas Firman..." class="w-full bg-surface-elevated border border-border rounded-lg p-2 text-text-primary text-xs outline-none resize-none font-body leading-relaxed"></textarea>
      </div>

      <div id="ai-mode-bullet-view" class="space-y-1.5" style="display: none;">
        <label class="text-[10px] text-text-secondary uppercase">Instruksi Poin-Poin (Per Baris)</label>
        <textarea id="ai-pref-bullet-input" rows="4" placeholder="Daftar poin aturan baku per baris..." class="w-full bg-surface-elevated border border-border rounded-lg p-2 text-text-primary text-xs outline-none resize-none font-body leading-relaxed"></textarea>
      </div>

      <button onclick="saveManualAiPreference()" class="w-full py-2 bg-primary text-black font-bold rounded-lg text-xs shadow-md flex items-center justify-center gap-1 active:scale-95">
        <span class="material-symbols-outlined text-[14px]">save</span> Simpan Preferensi AI
      </button>

      <div class="border-t border-border/50 pt-2.5 space-y-2">
        <div class="flex justify-between items-center">
          <span class="font-headline font-bold text-xs text-text-primary flex items-center gap-1">
            <span class="material-symbols-outlined text-lime text-[14px]">auto_awesome</span> Rangkuman Koreksi dari Chat
          </span>
          <span class="text-[9px] text-lime font-bold">Auto-Synthesizer</span>
        </div>
        <p class="text-[9px] text-text-secondary leading-relaxed">
          Membaca seluruh koreksi di chat, menyaring poin kembar (anti-duplikasi), dan otomatis memasukkannya ke Deskripsi & Poin Baku di atas.
        </p>

        <button onclick="executeGenerateAndPurgeSummary()" class="w-full py-2 bg-lime text-black font-bold rounded-lg text-xs shadow-md flex items-center justify-center gap-1 active:scale-95">
          <span class="material-symbols-outlined text-[14px]">bolt</span> Generate Rangkuman Sekarang
        </button>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- 📝 MODAL DIALOG: TAMBAH / EDIT TRANSAKSI -->
  <!-- ========================================================================= -->
  <div id="modal-tx" class="modal-overlay">
    <div class="bg-surface border border-border rounded-2xl p-4 w-full max-w-sm space-y-3 font-mono">
      <div class="flex justify-between items-center border-b border-border/50 pb-2">
        <h3 class="font-headline font-bold text-sm text-text-primary" id="modal-tx-title">Tambah Transaksi Baru</h3>
        <button onclick="closeTxModal()" class="text-text-secondary hover:text-text-primary text-sm font-bold active:scale-90">✕</button>
      </div>

      <input type="hidden" id="modal-tx-id" value=""/>

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
          <select id="modal-tx-wallet" class="w-full bg-surface-elevated border border-border rounded-lg p-2 text-text-primary outline-none mt-0.5"></select>
        </div>
        <div>
          <label class="text-[10px] text-text-secondary uppercase">Keterangan / Merchant</label>
          <input id="modal-tx-desc" type="text" placeholder="Contoh: Bensin Motor" class="w-full bg-surface-elevated border border-border rounded-lg p-2 text-text-primary outline-none mt-0.5"/>
        </div>
      </div>

      <div class="flex gap-2 pt-2">
        <button onclick="closeTxModal()" class="flex-1 py-2 bg-surface-elevated text-text-secondary font-bold rounded-lg border border-border text-xs active:scale-95">Batal</button>
        <button onclick="submitTxData()" class="flex-1 py-2 bg-lime text-black font-bold rounded-lg text-xs shadow-md active:scale-95">Simpan Data</button>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- 📋 MODAL DIALOG: TAMBAH / EDIT AGENDA AKTIVITAS -->
  <!-- ========================================================================= -->
  <div id="modal-act" class="modal-overlay">
    <div class="bg-surface border border-border rounded-2xl p-4 w-full max-w-sm space-y-3 font-mono">
      <div class="flex justify-between items-center border-b border-border/50 pb-2">
        <h3 class="font-headline font-bold text-sm text-text-primary" id="modal-act-title">Tambah Agenda Baru</h3>
        <button onclick="closeActModal()" class="text-text-secondary hover:text-text-primary text-sm font-bold active:scale-90">✕</button>
      </div>

      <input type="hidden" id="modal-act-id" value=""/>

      <div class="space-y-2 text-xs">
        <div>
          <label class="text-[10px] text-text-secondary uppercase">Judul Kegiatan</label>
          <input id="modal-act-name" type="text" placeholder="Contoh: Trip Dieng 2026" class="w-full bg-surface-elevated border border-border rounded-lg p-2 text-text-primary outline-none mt-0.5"/>
        </div>
        <div>
          <label class="text-[10px] text-text-secondary uppercase">Status</label>
          <select id="modal-act-status" class="w-full bg-surface-elevated border border-border rounded-lg p-2 text-text-primary outline-none mt-0.5">
            <option value="pending">Terjadwal (Pending)</option>
            <option value="in_progress">Sedang Berjalan (In Progress)</option>
            <option value="completed">Selesai (Completed)</option>
          </select>
        </div>
        <div>
          <label class="text-[10px] text-text-secondary uppercase">Prioritas</label>
          <select id="modal-act-priority" class="w-full bg-surface-elevated border border-border rounded-lg p-2 text-text-primary outline-none mt-0.5">
            <option value="high">Tinggi (High)</option>
            <option value="medium">Sedang (Medium)</option>
            <option value="low">Rendah (Low)</option>
          </select>
        </div>
        <div>
          <label class="text-[10px] text-text-secondary uppercase">Tanggal / Waktu</label>
          <input id="modal-act-time" type="date" class="w-full bg-surface-elevated border border-border rounded-lg p-2 text-text-primary outline-none mt-0.5"/>
        </div>
      </div>

      <div class="flex gap-2 pt-2">
        <button onclick="closeActModal()" class="flex-1 py-2 bg-surface-elevated text-text-secondary font-bold rounded-lg border border-border text-xs active:scale-95">Batal</button>
        <button onclick="submitActData()" class="flex-1 py-2 bg-lime text-black font-bold rounded-lg text-xs shadow-md active:scale-95">Simpan Agenda</button>
      </div>
    </div>
  </div>

  <!-- ⚡ SCRIPT -->
  <script src="app.js"></script>
</body>
</html>
`;

export default function MobileAppPage() {
  return (
    <div className="fixed inset-0 w-full h-full bg-[#0B0F12] overflow-hidden flex flex-col justify-center items-center">
      <iframe
        srcDoc={HTML_SOURCE}
        className="w-full h-full border-none"
        title="Raphael Mobile"
      />
    </div>
  );
}
