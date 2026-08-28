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
    input, textarea, select {
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
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    .modal-overlay.child-modal {
      z-index: 150 !important;
      background: rgba(0, 0, 0, 0.9) !important;
      backdrop-filter: blur(4px);
    }
    .modal-overlay.emergency-modal {
      z-index: 200 !important;
      background: rgba(0, 0, 0, 0.92) !important;
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
  
  /* 🖥️ TABLET & RESPONSIVE MULTI-FORM-FACTOR ADAPTIVE STYLES */
  html.user-authenticated #onboarding-screen,
  html.user-authenticated #login-screen {
    display: none !important;
  }

  @media (min-width: 768px) {
    body {
      background-color: #050709 !important;
    }
    #app-container {
      max-width: 900px !important;
      margin-left: auto !important;
      margin-right: auto !important;
      border-left: 1px solid #1C242C;
      border-right: 1px solid #1C242C;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    .modal-overlay > div {
      max-width: 540px !important;
    }
    #bottom-nav {
      max-width: 600px !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      border-radius: 24px !important;
      margin-bottom: 8px !important;
      border: 1px solid #28323E !important;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8) !important;
    }
  }

</style>

<script>
  // Immediate Zero-Flicker Session Check
  (function() {
    let isLogged = false;
    try {
      if (window.Android && typeof window.Android.getItem === 'function') {
        isLogged = window.Android.getItem('is_logged_in') === 'true';
      }
    } catch(e){}
    if (!isLogged) {
      try { isLogged = localStorage.getItem('is_logged_in') === 'true'; } catch(e){}
    }
    if (isLogged) {
      document.documentElement.classList.add('user-authenticated');
    }
  })();
</script>

</head>
<body class="flex flex-col h-full w-full text-xs bg-background" oncontextmenu="return false;">
<div id="app-container" class="flex flex-col h-full w-full relative overflow-hidden">

  <!-- 🌟 SCREEN 1: ONBOARDING CAROUSEL SCREEN -->
  <div id="onboarding-screen" class="fixed inset-0 z-[300] bg-background flex flex-col justify-between p-6 select-none transition-opacity duration-300">
    <!-- Top Skip Button -->
    <div class="flex justify-between items-center pt-2">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-primary/20 border border-primary flex items-center justify-center text-primary font-bold font-headline text-xs">
          R
        </div>
        <span class="font-headline font-bold text-sm text-text-primary tracking-wider">RAPHAEL AI</span>
      </div>
      <button onclick="skipOnboarding()" class="text-[11px] font-mono font-bold text-text-secondary hover:text-lime px-3 py-1 rounded-full bg-surface-elevated border border-border/60">
        Lewati
      </button>
    </div>

    <!-- Carousel Container -->
    <div class="flex-1 flex flex-col justify-center items-center my-auto relative overflow-hidden py-4">
      
      <!-- Slide 1 -->
      <div id="onboard-slide-1" class="onboard-slide w-full flex flex-col items-center text-center space-y-4 animate-fade">
        <div class="w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary/30 to-tosca/20 border-2 border-primary/50 flex items-center justify-center shadow-2xl tosca-bloom">
          <span class="material-symbols-outlined text-[48px] text-primary">smart_toy</span>
        </div>
        <div class="space-y-1.5 max-w-xs">
          <span class="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-primary/20 text-primary font-bold border border-primary/30">Personal Butler</span>
          <h2 class="font-headline font-black text-xl text-text-primary">Asisten Finansial & Waktu</h2>
          <p class="text-xs text-text-secondary font-body leading-relaxed">
            Dampingi pencatatan keuangan, pelunasan pinjaman Bank Jago, cek transaksi via kamera, dan analisis cerdas harian Anda.
          </p>
        </div>
      </div>

      <!-- Slide 2 -->
      <div id="onboard-slide-2" class="onboard-slide w-full flex-col items-center text-center space-y-4 hidden animate-fade">
        <div class="w-24 h-24 rounded-3xl bg-gradient-to-tr from-lime/30 to-emerald/20 border-2 border-lime/50 flex items-center justify-center shadow-2xl">
          <span class="material-symbols-outlined text-[48px] text-lime">sync_alt</span>
        </div>
        <div class="space-y-1.5 max-w-xs">
          <span class="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-lime/20 text-lime font-bold border border-lime/30">Dual-Engine Sync</span>
          <h2 class="font-headline font-black text-xl text-text-primary">Keuangan & Agenda Terpadu</h2>
          <p class="text-xs text-text-secondary font-body leading-relaxed">
            Korelasikan rencana Trip Dieng, akumulasi narik Gojek, logbook motor Beat, dan estimasi BBM secara otomatis dalam satu wadah.
          </p>
        </div>
      </div>

      <!-- Slide 3 -->
      <div id="onboard-slide-3" class="onboard-slide w-full flex-col items-center text-center space-y-4 hidden animate-fade">
        <div class="w-24 h-24 rounded-3xl bg-gradient-to-tr from-coral/30 to-amber/20 border-2 border-coral/50 flex items-center justify-center shadow-2xl">
          <span class="material-symbols-outlined text-[48px] text-coral">security</span>
        </div>
        <div class="space-y-1.5 max-w-xs">
          <span class="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-coral/20 text-coral font-bold border border-coral/30">Proteksi Pintar</span>
          <h2 class="font-headline font-black text-xl text-text-primary">Deteksi Bentrok & SOS ICE</h2>
          <p class="text-xs text-text-secondary font-body leading-relaxed">
            Peringatan cerdas jadwal bentrok multi-hari, batas belanja harian aman, dan pusat tombol darurat medis cepat (SOS).
          </p>
        </div>
      </div>

    </div>

    <!-- Bottom Controls & Dots -->
    <div class="space-y-5 pb-4">
      <!-- Dots Indicator -->
      <div class="flex justify-center items-center gap-2">
        <span id="dot-1" class="w-6 h-2 rounded-full bg-primary transition-all duration-300"></span>
        <span id="dot-2" class="w-2 h-2 rounded-full bg-border transition-all duration-300"></span>
        <span id="dot-3" class="w-2 h-2 rounded-full bg-border transition-all duration-300"></span>
      </div>

      <!-- Action Button -->
      <button id="btn-onboard-next" onclick="nextOnboardSlide()" class="w-full py-3.5 bg-gradient-to-r from-primary to-tosca text-black font-headline font-bold text-sm rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
        <span>Lanjutkan</span>
        <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
      </button>
    </div>
  </div>


  <!-- 🔐 SCREEN 2: MODERN LOGIN & AUTHENTICATION SCREEN -->
  <div id="login-screen" class="fixed inset-0 z-[290] bg-background flex flex-col justify-between p-6 select-none overflow-y-auto hidden">
    <!-- Header Brand -->
    <div class="text-center pt-4 space-y-2">
      <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary/30 to-tosca/20 border-2 border-primary mx-auto flex items-center justify-center shadow-xl tosca-bloom">
        <span class="material-symbols-outlined text-[36px] text-primary">robot_2</span>
      </div>
      <div>
        <h1 class="font-headline font-black text-xl text-text-primary tracking-tight">RAPHAEL COCKPIT</h1>
        <p class="text-[10px] font-mono text-text-secondary">Autentikasi & Masuk Akun Eksekutif</p>
      </div>
    </div>

    <!-- Login Box -->
    <div class="bg-surface rounded-2xl p-4 border border-border space-y-3.5 my-auto shadow-2xl">
      
      <!-- 1-Tap Quick Login Button -->
      <div class="space-y-1.5">
        <span class="text-[9px] font-mono text-text-secondary uppercase">Akses Cepat Pengguna Terverifikasi</span>
        <button onclick="loginQuickMasFirman()" class="w-full py-3 bg-gradient-to-r from-lime/20 to-primary/20 border-2 border-lime/60 hover:border-lime rounded-xl text-text-primary font-headline font-bold text-xs flex items-center justify-between px-3 active:scale-95 transition-all shadow">
          <div class="flex items-center gap-2.5 text-left">
            <div class="w-8 h-8 rounded-full bg-lime text-black flex items-center justify-center font-bold text-xs font-headline">
              MF
            </div>
            <div>
              <p class="font-bold text-text-primary text-xs flex items-center gap-1">
                Mas Firman <span class="material-symbols-outlined text-lime text-[14px]">verified</span>
              </p>
              <p class="text-[9px] font-mono text-lime">ID: 1084842050 (Aktif)</p>
            </div>
          </div>
          <span class="material-symbols-outlined text-lime text-[20px]">login</span>
        </button>
      </div>

      <div class="flex items-center gap-2 my-1">
        <div class="h-px bg-border flex-1"></div>
        <span class="text-[9px] font-mono text-text-secondary uppercase">atau masuk mandiri</span>
        <div class="h-px bg-border flex-1"></div>
      </div>

      <!-- Manual Input Form -->
      <form onsubmit="handleManualLogin(event)" class="space-y-2.5 font-mono text-xs">
        <div>
          <label class="text-[9px] text-text-secondary uppercase">Nama Panggilan Pengguna</label>
          <input id="login-input-name" type="text" value="Mas Firman" placeholder="Nama Anda..." class="w-full bg-surface-elevated border border-border rounded-lg p-2.5 text-text-primary text-xs outline-none mt-1 focus:border-primary"/>
        </div>

        <div>
          <label class="text-[9px] text-text-secondary uppercase">Telegram User ID / User ID</label>
          <input id="login-input-id" type="text" value="1084842050" placeholder="Contoh: 1084842050" class="w-full bg-surface-elevated border border-border rounded-lg p-2.5 text-text-primary text-xs outline-none mt-1 focus:border-primary"/>
        </div>

        <div>
          <label class="text-[9px] text-text-secondary uppercase">PIN / Kode Akses Keamanan</label>
          <input id="login-input-pin" type="password" value="2026" placeholder="Masukkan 4-digit PIN..." class="w-full bg-surface-elevated border border-border rounded-lg p-2.5 text-text-primary text-xs outline-none mt-1 focus:border-primary"/>
        </div>

        <button type="submit" class="w-full py-3 bg-primary text-black font-headline font-bold text-xs rounded-xl shadow active:scale-95 transition-all flex items-center justify-center gap-1.5 mt-2">
          <span class="material-symbols-outlined text-[16px]">lock_open</span>
          <span>Masuk ke Dashboard</span>
        </button>
      </form>
    </div>

    <!-- Footer Privacy -->
    <div class="text-center space-y-1 pb-2">
      <p class="text-[9px] font-mono text-text-secondary flex items-center justify-center gap-1">
        <span class="material-symbols-outlined text-[12px] text-emerald">lock</span> Terenkripsi & Terhubung Langsung ke Supabase
      </p>
      <p class="text-[8px] font-mono text-text-secondary/60">Raphael AI System v2.3.1 • Executive Edition</p>
    </div>
  </div>


  <!-- Floating Toast Notification -->
  <div id="toast-notification" class="bg-surface-elevated border border-lime text-lime px-3.5 py-1.5 rounded-full font-mono text-[10px] font-bold shadow-2xl flex items-center gap-1.5">
    <span class="material-symbols-outlined text-[14px]">check_circle</span>
    <span id="toast-message">Notifikasi Berhasil</span>
  </div>

  <!-- ========================================================================= -->
  <!-- 🔝 TOP APP BAR (HEADER RAPHAEL) -->
  <!-- ========================================================================= -->
      <header class="px-3.5 py-2.5 flex justify-between items-center border-b border-border/40 shrink-0 z-30 sticky top-0 bg-background/95 backdrop-blur-md">
      <!-- Left: Logo & Bot Name & Live Location -->
      <div class="flex items-center gap-2.5">
        <button onclick="openAiSettingsModal()" class="relative flex items-center justify-center active:scale-95 transition-transform" title="Pengaturan AI">
          <div class="w-8 h-8 rounded-full bg-surface border border-primary/40 flex items-center justify-center text-primary shadow">
            <span class="material-symbols-outlined text-[18px]">smart_toy</span>
          </div>
          <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-lime rounded-full border-2 border-background animate-pulse"></span>
        </button>
        <div>
          <div class="flex items-center gap-1.5">
            <h1 class="font-headline font-bold text-sm tracking-wide text-text-primary">Raphael</h1>
            <span class="text-[8px] font-mono px-1.5 py-0.2 rounded bg-primary/20 text-primary font-bold border border-primary/30">AI</span>
          </div>
          <p class="text-[10px] font-mono text-lime flex items-center gap-1" id="header-location">
            <span class="w-1.5 h-1.5 rounded-full bg-lime"></span>
            <span id="header-city-text">SIDOARJO</span> <span class="text-text-secondary" id="header-temp-text">(28°C)</span>
          </p>
        </div>
      </div>

      <!-- Right: Clean Live Sync Status Pill -->
      <button onclick="openDatabaseSyncModal()" class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-elevated border border-border/60 font-mono text-[9px] text-text-secondary active:scale-95 hover:border-tosca/50 transition-all shadow-sm">
        <span class="w-1.5 h-1.5 rounded-full bg-lime animate-pulse"></span>
        <span class="font-bold text-text-primary">LIVE SYNC</span>
      </button>
    </header>

  <!-- ========================================================================= -->
  <!-- 📱 MAIN VIEW CANVAS (5 ISOLATED INDEPENDENT TABS) -->
  <!-- ========================================================================= -->
  <main class="flex-1 overflow-hidden relative w-full">

    <!-- ======================================================================= -->
    <!-- 📊 TAB 1: ANALYTICS & TIMELINE GANTT CHART (100% FULL COCKPIT) -->
    <div id="tab-analytics" class="tab-pane px-3.5 py-2.5 space-y-3">
      
      <!-- Top Title & Timeframe Selector Bar -->
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="font-headline font-bold text-sm text-text-primary flex items-center gap-1.5">
              <span class="material-symbols-outlined text-primary text-[18px]">insights</span> Cockpit Analisis Lengkap
            </h2>
            <p class="text-[9px] font-mono text-text-secondary">Visualisasi Finansial, Mobilitas & Perencanaan</p>
          </div>
          <span class="text-[9px] font-mono px-2 py-0.5 rounded-full bg-lime/20 text-lime font-bold border border-lime/30">Live Sync</span>
        </div>

        <!-- 5-Timeframe Perspective Bar -->
        <div class="flex gap-1 bg-surface-elevated p-1 rounded-xl border border-border overflow-x-auto hide-scrollbar text-[9px] font-mono font-bold">
          <button id="tf-btn-today" onclick="changeAnalyticsTimeframe('today')" class="px-2.5 py-1 rounded-lg text-text-secondary shrink-0">Hari Ini</button>
          <button id="tf-btn-7d" onclick="changeAnalyticsTimeframe('7d')" class="px-2.5 py-1 rounded-lg text-text-secondary shrink-0">7 Hari</button>
          <button id="tf-btn-month" onclick="changeAnalyticsTimeframe('month')" class="px-2.5 py-1 rounded-lg bg-primary text-black font-bold shrink-0">Bulan Ini</button>
          <button id="tf-btn-90d" onclick="changeAnalyticsTimeframe('90d')" class="px-2.5 py-1 rounded-lg text-text-secondary shrink-0">90 Hari</button>
          <button id="tf-btn-all" onclick="changeAnalyticsTimeframe('all')" class="px-2.5 py-1 rounded-lg text-text-secondary shrink-0">Semua</button>
        </div>
      </div>

      <!-- 1. INTERACTIVE CHARTS WITH PERSPECTIVE SWITCHER -->
      <div class="bg-surface rounded-xl p-3 border border-border space-y-2.5 shadow-md">
        <div class="flex justify-between items-center border-b border-border/50 pb-2">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-primary text-[16px]">monitoring</span>
            <h3 class="font-headline font-bold text-xs text-text-primary">GRAFIK TREN KEUANGAN</h3>
          </div>
          
          <div class="flex gap-1 font-mono text-[8px]">
            <button id="chart-tab-line-btn" onclick="switchAnalyticsChart('line')" class="px-2 py-0.5 rounded bg-primary text-black font-bold">Garis</button>
            <button id="chart-tab-donut-btn" onclick="switchAnalyticsChart('donut')" class="px-2 py-0.5 rounded bg-surface-elevated text-text-secondary">Alokasi</button>
            <button id="chart-tab-bar-btn" onclick="switchAnalyticsChart('bar')" class="px-2 py-0.5 rounded bg-surface-elevated text-text-secondary">Batang</button>
          </div>
        </div>

        <div id="analytics-line-wrapper" class="w-full h-44">
          <canvas id="tab-analytics-line-chart"></canvas>
        </div>
        <div id="analytics-donut-wrapper" class="w-full h-44 hidden">
          <canvas id="tab-analytics-donut-chart"></canvas>
        </div>
        <div id="analytics-bar-wrapper" class="w-full h-44 hidden">
          <canvas id="tab-analytics-bar-chart"></canvas>
        </div>
      </div>

      <!-- 2. CARD-CARD EKSEKUTIF TEMATIK (TERPISAH & RELEVAN SECARA MANDIRI) -->
      <div class="space-y-3 font-mono">

        <!-- CARD 1: SALDO LIKUID & KESEHATAN DOMPET -->
        <div class="bg-surface rounded-2xl p-3.5 border-l-4 border-emerald border border-border space-y-2.5 shadow-md">
          <div class="flex justify-between items-center border-b border-border/50 pb-2">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-emerald/20 text-emerald flex items-center justify-center">
                <span class="material-symbols-outlined text-[16px]">account_balance_wallet</span>
              </div>
              <div>
                <h4 class="font-bold text-xs text-text-primary">Saldo Likuid & Kas Aktif</h4>
                <p class="text-[8px] text-text-secondary">Kondisi dompet multi-channel realtime</p>
              </div>
            </div>
            <span class="text-[9px] px-2 py-0.5 rounded bg-emerald/20 text-emerald font-bold">OPTIMAL</span>
          </div>

          <div class="flex justify-between items-end">
            <div>
              <span class="text-[9px] text-text-secondary">TOTAL SALDO TERSEDIA</span>
              <p class="text-base font-bold text-emerald" id="an-total-liquid">Rp 326.000</p>
            </div>
            <div class="text-right text-[9px]">
              <span class="text-text-secondary">Cash Runway:</span>
              <p class="font-bold text-lime">~14 Hari Aman</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-1.5 pt-1 text-[9px]">
            <div class="p-2 rounded-lg bg-surface-elevated flex justify-between items-center">
              <span class="text-text-secondary">💵 Kas Kertas:</span>
              <span class="font-bold text-text-primary">Rp 162.000</span>
            </div>
            <div class="p-2 rounded-lg bg-surface-elevated flex justify-between items-center">
              <span class="text-text-secondary">💳 Gopay Driver:</span>
              <span class="font-bold text-text-primary">Rp 164.000</span>
            </div>
          </div>
        </div>

        <!-- CARD 2: BURN RATE & BATAS BELANJA AMAN -->
        <div class="bg-surface rounded-2xl p-3.5 border-l-4 border-lime border border-border space-y-2.5 shadow-md">
          <div class="flex justify-between items-center border-b border-border/50 pb-2">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-lime/20 text-lime flex items-center justify-center">
                <span class="material-symbols-outlined text-[16px]">local_fire_department</span>
              </div>
              <div>
                <h4 class="font-bold text-xs text-text-primary">Burn Rate & Batas Belanja Aman</h4>
                <p class="text-[8px] text-text-secondary">Alokasi konsumsi harian terkendali</p>
              </div>
            </div>
            <span class="text-[9px] px-2 py-0.5 rounded bg-lime/20 text-lime font-bold">STABIL</span>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="p-2.5 rounded-xl bg-surface-elevated space-y-0.5">
              <span class="text-[8px] text-text-secondary">BATAS AMAN HARI INI</span>
              <p class="text-sm font-bold text-lime" id="an-daily-budget">Rp 48.500 / hr</p>
            </div>
            <div class="p-2.5 rounded-xl bg-surface-elevated space-y-0.5">
              <span class="text-[8px] text-text-secondary">BURN RATE HARIAN</span>
              <p class="text-sm font-bold text-text-primary">Rp 23.400 / hr</p>
            </div>
          </div>

          <div class="p-2 rounded-lg bg-surface-elevated text-[9px] flex justify-between items-center">
            <span class="text-text-secondary">Rasio Tabungan vs Belanja:</span>
            <span class="font-bold text-tosca">62% Terjaga Sehat</span>
          </div>
        </div>

        <!-- CARD 3: TARGET TRIP KE DIENG -->
        <div class="bg-surface rounded-2xl p-3.5 border-l-4 border-tosca border border-border space-y-2.5 shadow-md">
          <div class="flex justify-between items-center border-b border-border/50 pb-2">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-tosca/20 text-tosca flex items-center justify-center">
                <span class="material-symbols-outlined text-[16px]">landscape</span>
              </div>
              <div>
                <h4 class="font-bold text-xs text-text-primary">Target & Dana Trip Dieng</h4>
                <p class="text-[8px] text-text-secondary">Jadwal Aktif: 29 - 30 Agustus 2026</p>
              </div>
            </div>
            <span class="text-[9px] px-2 py-0.5 rounded bg-tosca/20 text-tosca font-bold">29-30 AGS</span>
          </div>

          <div class="flex justify-between items-center text-[10px]">
            <div>
              <span class="text-text-secondary text-[8px]">DANA TERKUMPUL (3x)</span>
              <p class="text-sm font-bold text-tosca" id="an-dieng-collected">Rp 300.000 <span class="text-[9px] text-text-secondary font-normal">/ Rp 1.040.000</span></p>
            </div>
            <div class="text-right">
              <span class="text-text-secondary text-[8px]">SISA KEKURANGAN</span>
              <p class="text-xs font-bold text-coral">Rp 740.000</p>
            </div>
          </div>

          <!-- Interactive Progress Bar -->
          <div class="space-y-1">
            <div class="w-full bg-surface-elevated h-2 rounded-full overflow-hidden">
              <div class="bg-tosca h-full rounded-full transition-all" style="width: 28.8%"></div>
            </div>
            <div class="flex justify-between text-[8px] text-text-secondary">
              <span>Progres Tabungan: 28.8%</span>
              <span class="text-lime font-bold">Kesiapan Logistik: 85%</span>
            </div>
          </div>

          <div class="p-2 rounded-lg bg-surface-elevated text-[9px] flex justify-between items-center">
            <span class="text-text-secondary">Kebutuhan Nabung:</span>
            <span class="font-bold text-primary">Rp 37.000 / hari</span>
          </div>
        </div>

        <!-- CARD 4: OPERASIONAL GOJEK & LOGBOOK BEAT FI -->
        <div class="bg-surface rounded-2xl p-3.5 border-l-4 border-primary border border-border space-y-2.5 shadow-md">
          <div class="flex justify-between items-center border-b border-border/50 pb-2">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined text-[16px]">two_wheeler</span>
              </div>
              <div>
                <h4 class="font-bold text-xs text-text-primary">Operasional Gojek & Beat FI</h4>
                <p class="text-[8px] text-text-secondary">Honda Beat FI (N 4321 ABC)</p>
              </div>
            </div>
            <span class="text-[9px] px-2 py-0.5 rounded bg-primary/20 text-primary font-bold">45.200 KM</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-[9px]">
            <div class="p-2 rounded-lg bg-surface-elevated space-y-0.5">
              <span class="text-text-secondary text-[8px]">KONSUMSI BBM</span>
              <p class="font-bold text-lime text-xs">~50.2 KM/L</p>
            </div>
            <div class="p-2 rounded-lg bg-surface-elevated space-y-0.5">
              <span class="text-text-secondary text-[8px]">TARGET NARIK / SHIFT</span>
              <p class="font-bold text-emerald text-xs">Rp 75.000</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-1.5 text-[9px]">
            <div class="p-2 rounded-lg bg-surface-elevated flex justify-between items-center">
              <span class="text-text-secondary">Biaya BBM:</span>
              <span class="font-bold text-text-primary">Rp 199 / KM</span>
            </div>
            <div class="p-2 rounded-lg bg-surface-elevated flex justify-between items-center">
              <span class="text-text-secondary">Servis CVT:</span>
              <span class="font-bold text-tosca">47.000 KM</span>
            </div>
          </div>
        </div>

        <!-- CARD 5: ANGSURAN BANK JAGO & MANAJEMEN HUTANG -->
        <div class="bg-surface rounded-2xl p-3.5 border-l-4 border-coral border border-border space-y-2.5 shadow-md">
          <div class="flex justify-between items-center border-b border-border/50 pb-2">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-coral/20 text-coral flex items-center justify-center">
                <span class="material-symbols-outlined text-[16px]">credit_card</span>
              </div>
              <div>
                <h4 class="font-bold text-xs text-text-primary">Angsuran Jago & Hutang</h4>
                <p class="text-[8px] text-text-secondary">Jatuh tempo setiap tanggal 20</p>
              </div>
            </div>
            <span class="text-[9px] px-2 py-0.5 rounded bg-coral/20 text-coral font-bold">TGL 20</span>
          </div>

          <div class="flex justify-between items-center text-[10px]">
            <div>
              <span class="text-text-secondary text-[8px]">ANGSURAN BULANAN</span>
              <p class="text-sm font-bold text-coral">Rp 67.940 <span class="text-[8px] text-text-secondary">/ bln</span></p>
            </div>
            <div class="text-right">
              <span class="text-text-secondary text-[8px]">DEBT RATIO (DTI)</span>
              <p class="text-xs font-bold text-emerald">14.2% (Aman)</p>
            </div>
          </div>

          <div class="p-2 rounded-lg bg-surface-elevated text-[9px] flex justify-between items-center">
            <span class="text-text-secondary">Sisa Pinjaman Pokok:</span>
            <span class="font-bold text-text-primary">Pinjaman Rp 600rb (2.99%)</span>
          </div>
        </div>

        <!-- CARD 6: PRODUKTIVITAS SKRIPSI & STATUS KESEHATAN SISTEM -->
        <div class="bg-surface rounded-2xl p-3.5 border-l-4 border-primary border border-border space-y-2.5 shadow-md">
          <div class="flex justify-between items-center border-b border-border/50 pb-2">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined text-[16px]">school</span>
              </div>
              <div>
                <h4 class="font-bold text-xs text-text-primary">Produktivitas Skripsi & Sistem</h4>
                <p class="text-[8px] text-text-secondary">Bimbingan Pak Sulthan (Bab 4-5)</p>
              </div>
            </div>
            <span class="text-[9px] px-2 py-0.5 rounded bg-lime/20 text-lime font-bold">94 / 100</span>
          </div>

          <div class="grid grid-cols-2 gap-2 text-[9px]">
            <div class="p-2 rounded-lg bg-surface-elevated space-y-0.5">
              <span class="text-text-secondary text-[8px]">TRAVEL TIME BUFFER</span>
              <p class="font-bold text-tosca text-xs">35 Menit</p>
            </div>
            <div class="p-2 rounded-lg bg-surface-elevated space-y-0.5">
              <span class="text-text-secondary text-[8px]">SKOR STRES FINANSIAL</span>
              <p class="font-bold text-emerald text-xs">18 / 100 (Tenang)</p>
            </div>
          </div>

          <div class="p-2 rounded-lg bg-surface-elevated text-[9px] flex justify-between items-center">
            <span class="text-text-secondary">Status Sistem & Data:</span>
            <span class="font-bold text-lime">100% Sinkron & Sehat</span>
          </div>
        </div>

      </div>

    </div>


    <!-- ======================================================================= -->
    <!--  TAB 2: DATA & EXPANDED DATABASE -->
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
                  <p class="font-bold text-text-primary" id="widget-vehicle-name">Honda Beat FI (N 4321 ABC)</p>
                  <p class="text-text-secondary" id="widget-vehicle-eff">Konsumsi: ~50.2 KM/L (Pertalite) • Odometer: 45.200 KM</p>
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

      <!-- 1. LIVE GPS WEATHER CARD -->
      <div class="bg-surface rounded-xl p-3 border-l-4 border-tosca border border-border space-y-1.5 shadow-md">
        <div class="flex justify-between items-center">
          <span class="text-[10px] font-mono font-bold text-tosca flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px]">near_me</span> CUACA REALTIME LOKASI ANDA
          </span>
          <span class="text-[8px] font-mono text-lime font-bold" id="weather-badge">GPS LIVE</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-2xl font-mono font-bold text-text-primary" id="weather-temp">28°C</span>
          <div>
            <h3 class="font-bold text-xs text-text-primary" id="weather-city">Sidoarjo, Jawa Timur</h3>
            <p class="text-[10px] text-text-secondary" id="weather-desc">Cerah Berawan • Angin 13 km/jam</p>
          </div>
        </div>
        <div class="p-1.5 rounded bg-surface-elevated font-mono text-[9px] text-lime flex items-center gap-1" id="weather-advice">
          <span class="material-symbols-outlined text-[13px]">check_circle</span> Kondisi jalanan kering & ideal untuk narik Gojek.
        </div>
      </div>

      <!-- 2. CLICKABLE MORNING BRIEFING NOTIFICATION CARD (DEDICATED) -->
      <div onclick="openTodayMorningBriefing()" class="bg-surface rounded-xl p-3 border-l-4 border-lime border border-border space-y-2.5 shadow-md cursor-pointer hover:border-lime transition-all active:scale-[0.99]">
        <div class="flex justify-between items-center border-b border-border/50 pb-1.5">
          <div class="flex items-center gap-1.5">
            <span class="material-symbols-outlined text-lime text-[16px]">wb_sunny</span>
            <h3 class="font-headline font-bold text-xs text-lime">MORNING BRIEFING HARI INI</h3>
          </div>
          <span class="text-[8px] font-mono px-1.5 py-0.5 rounded bg-lime/20 text-lime font-bold">STATUS BAR AKTIF</span>
        </div>

        <div class="space-y-1 font-mono text-[10px]">
          <p class="font-bold text-text-primary text-xs" id="briefing-card-greeting">Pagi Mas Firman! Siap beraktivitas hari ini?</p>
          <div class="grid grid-cols-2 gap-1.5 pt-1 text-[9px]">
            <div class="p-1.5 rounded bg-surface-elevated">
              <span class="text-text-secondary">Batas Belanja Aman:</span>
              <p class="font-bold text-lime" id="briefing-card-budget">Rp 48.500 / hr</p>
            </div>
            <div class="p-1.5 rounded bg-surface-elevated">
              <span class="text-text-secondary">Saldo Likuid Kas:</span>
              <p class="font-bold text-emerald" id="briefing-card-liquid">Rp 326.000</p>
            </div>
          </div>
          <div class="p-1.5 rounded bg-surface-elevated text-[9px] text-text-secondary">
            <span class="text-coral font-bold">⚠️ Tugas Urgent:</span> Hutang Rifky (Rp 150k) • Cicilan Jago (Rp 67.940)
          </div>
        </div>

        <div class="flex gap-2 pt-0.5" onclick="event.stopPropagation()">
          <button onclick="openTodayMorningBriefing()" class="flex-1 py-1.5 px-2 rounded-lg bg-lime text-black font-bold text-[10px] active:scale-95 flex items-center justify-center gap-1 shadow font-mono">
            <span class="material-symbols-outlined text-[13px]">visibility</span> Buka Ringkasan Lengkap
          </button>
          <button onclick="testMorningBriefing()" class="py-1.5 px-2.5 rounded-lg bg-surface-elevated border border-primary/50 text-primary font-bold text-[10px] active:scale-95 flex items-center justify-center gap-1 shadow font-mono">
            <span class="material-symbols-outlined text-[13px]">notifications_active</span> Uji Notif
          </button>
        </div>

        <div class="space-y-1.5 pt-1 border-t border-border/40" onclick="event.stopPropagation()">
          <p class="text-[9px] font-mono text-text-secondary">Arsip Riwayat Briefing 7 Hari:</p>
          <div id="briefing-history-list" class="space-y-1.5 font-mono text-[10px]">
            <!-- Dynamic Briefing List renders here -->
          </div>
        </div>
      </div>

      <!-- 3. BILLS / TAGIHAN CONTAINER -->
      <div id="dynamic-bills-container" class="space-y-2"></div>

    </div>


    <!-- ======================================================================= -->
    <!--  TAB 5: PROFILE, DYNAMIC HUB, MORNING BRIEFING & INTEGRATION SETTINGS -->
    <div id="tab-profile" class="tab-pane px-3.5 py-2.5 space-y-3 font-mono">
      
      <!-- Top Title Header -->
      <div class="flex justify-between items-center">
        <div>
          <h2 class="font-headline font-bold text-sm text-text-primary flex items-center gap-1.5">
            <span class="material-symbols-outlined text-primary text-[18px]">manage_accounts</span> Profil & Pengaturan
          </h2>
          <p class="text-[9px] font-mono text-text-secondary">Ketuk fitur untuk melihat rincian & mengedit data</p>
        </div>
        <span class="text-[9px] font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold border border-primary/30">Master Config</span>
      </div>

      <!-- 1. HERO USER IDENTITY CARD (TAP TO EDIT NAME) -->
      <div onclick="openEditProfileNameModal()" class="bg-surface rounded-2xl p-3.5 border border-border space-y-2 tosca-bloom shadow-md cursor-pointer hover:border-primary/60 transition-all active:scale-[0.99]">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary font-bold text-base shrink-0 font-headline shadow-sm" id="profile-avatar-initials">
              MF
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <h3 class="font-headline font-bold text-sm text-text-primary" id="profile-display-name">Mas Firman</h3>
                <span class="p-1 rounded bg-surface-elevated text-primary border border-border/60 flex items-center justify-center">
                  <span class="material-symbols-outlined text-[12px]">edit</span>
                </span>
              </div>
              <p class="text-[9px] font-mono text-lime flex items-center gap-1 mt-0.5">
                <span class="material-symbols-outlined text-[12px]">verified</span> Terverifikasi (ID: 1084842050)
              </p>
            </div>
          </div>
          <span class="material-symbols-outlined text-text-secondary text-[18px]">chevron_right</span>
        </div>
      </div>

      <!-- 2. INTERACTIVE FEATURE SETTINGS TILES (CLEAN & MODAL-DRIVEN) -->
      <div class="space-y-2 font-mono">

        <!-- TILE 1: KECERDASAN & PERSONA AI -->
        <div onclick="openAiSettingsModal()" class="bg-surface p-3 rounded-xl border border-border flex justify-between items-center shadow-sm cursor-pointer hover:border-primary/50 transition-all active:scale-[0.99]">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[16px]">tune</span>
            </div>
            <div>
              <h4 class="font-bold text-xs text-text-primary">Kecerdasan & Persona AI</h4>
              <p class="text-[8px] text-text-secondary">Model Gemini 2.5 Flash, Grounding & Memori</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-[8px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">AKTIF</span>
            <span class="material-symbols-outlined text-text-secondary text-[16px]">chevron_right</span>
          </div>
        </div>

        <!-- TILE 2: JADWAL MORNING BRIEFING -->
        <div onclick="openBriefingScheduleModal()" class="bg-surface p-3 rounded-xl border border-border flex justify-between items-center shadow-sm cursor-pointer hover:border-lime/50 transition-all active:scale-[0.99]">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-lime/20 text-lime flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[16px]">wb_sunny</span>
            </div>
            <div>
              <h4 class="font-bold text-xs text-text-primary">Jadwal Morning Briefing</h4>
              <p class="text-[8px] text-text-secondary" id="tile-briefing-time-label">Setiap Pukul 07:00 WIB • Notif Status Bar</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-[8px] px-1.5 py-0.5 rounded bg-lime/20 text-lime font-bold">07:00 WIB</span>
            <span class="material-symbols-outlined text-text-secondary text-[16px]">chevron_right</span>
          </div>
        </div>

        <!-- TILE 3: ARMADA KENDARAAN & ODOMETER -->
        <div onclick="openDynamicHubModal('vehicles')" class="bg-surface p-3 rounded-xl border border-border flex justify-between items-center shadow-sm cursor-pointer hover:border-primary/50 transition-all active:scale-[0.99]">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[16px]">two_wheeler</span>
            </div>
            <div>
              <h4 class="font-bold text-xs text-text-primary">Armada Motor & Odometer</h4>
              <p class="text-[8px] text-text-secondary">Honda Beat FI (N 4321 ABC) • 45.200 KM</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-[8px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-secondary font-bold">Kelola</span>
            <span class="material-symbols-outlined text-text-secondary text-[16px]">chevron_right</span>
          </div>
        </div>

        <!-- TILE 4: STATUS DOMPET & KAS -->
        <div onclick="openDynamicHubModal('wallets')" class="bg-surface p-3 rounded-xl border border-border flex justify-between items-center shadow-sm cursor-pointer hover:border-emerald/50 transition-all active:scale-[0.99]">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-emerald/20 text-emerald flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[16px]">account_balance_wallet</span>
            </div>
            <div>
              <h4 class="font-bold text-xs text-text-primary">Status Dompet & Saldo</h4>
              <p class="text-[8px] text-text-secondary">Kas Kertas, Gopay, SeaBank, Bank Jago</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-[8px] px-1.5 py-0.5 rounded bg-emerald/20 text-emerald font-bold">4 Akun</span>
            <span class="material-symbols-outlined text-text-secondary text-[16px]">chevron_right</span>
          </div>
        </div>

        <!-- TILE 5: TARGET MENABUNG & SINKING FUNDS -->
        <div onclick="openDynamicHubModal('targets')" class="bg-surface p-3 rounded-xl border border-border flex justify-between items-center shadow-sm cursor-pointer hover:border-tosca/50 transition-all active:scale-[0.99]">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-tosca/20 text-tosca flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[16px]">savings</span>
            </div>
            <div>
              <h4 class="font-bold text-xs text-text-primary">Target Menabung & Liburan</h4>
              <p class="text-[8px] text-text-secondary">Trip Dieng 2026, Sinking Fund Servis & Skripsi</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-[8px] px-1.5 py-0.5 rounded bg-tosca/20 text-tosca font-bold">Rp 1.04jt</span>
            <span class="material-symbols-outlined text-text-secondary text-[16px]">chevron_right</span>
          </div>
        </div>

        <!-- TILE 6: PROFIL DARURAT & KONTAK MEDIS (ICE) -->
        <div onclick="openIceEmergencyModal()" class="bg-surface p-3 rounded-xl border border-border flex justify-between items-center shadow-sm cursor-pointer hover:border-coral/50 transition-all active:scale-[0.99]">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-coral/20 text-coral flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[16px]">emergency</span>
            </div>
            <div>
              <h4 class="font-bold text-xs text-text-primary">Profil Darurat (SOS / ICE)</h4>
              <p class="text-[8px] text-text-secondary">Gol. Darah: O (Positif) • Kontak Keluarga Lengkap</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-[8px] px-1.5 py-0.5 rounded bg-coral/20 text-coral font-bold">LENGKAP</span>
            <span class="material-symbols-outlined text-text-secondary text-[16px]">chevron_right</span>
          </div>
        </div>

        <!-- TILE 7: INTEGRASI DATABASE & SINKRONISASI -->
        <div onclick="openDatabaseSyncModal()" class="bg-surface p-3 rounded-xl border border-border flex justify-between items-center shadow-sm cursor-pointer hover:border-tosca/50 transition-all active:scale-[0.99]">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-tosca/20 text-tosca flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[16px]">cloud_sync</span>
            </div>
            <div>
              <h4 class="font-bold text-xs text-text-primary">Status Database & Integrasi</h4>
              <p class="text-[8px] text-text-secondary">Supabase PostgreSQL Live Sync • Export Excel</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-[8px] px-1.5 py-0.5 rounded bg-emerald/20 text-emerald font-bold">ONLINE</span>
            <span class="material-symbols-outlined text-text-secondary text-[16px]">chevron_right</span>
          </div>
        </div>

        <!-- TILE 8: INFORMASI SISTEM & CHANGELOG -->
        <div onclick="openChangelogModal()" class="bg-surface p-3 rounded-xl border border-border flex justify-between items-center shadow-sm cursor-pointer hover:border-primary/50 transition-all active:scale-[0.99]">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-surface-elevated text-primary flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[16px]">info</span>
            </div>
            <div>
              <h4 class="font-bold text-xs text-text-primary">Informasi Versi & Sistem</h4>
              <p class="text-[8px] text-text-secondary">Raphael Cockpit Executive • Changelog Log</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-[8px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold" id="profile-app-version-badge">v2.7.2</span>
            <span class="material-symbols-outlined text-text-secondary text-[16px]">chevron_right</span>
          </div>
        </div>

      </div>

      <!-- 3. LOGOUT / GANTI AKUN BUTTON -->
      <div class="pt-2">
        <button onclick="handleLogout()" class="w-full py-2.5 bg-surface-elevated border border-coral/30 text-coral font-bold rounded-xl text-xs font-mono shadow-sm active:scale-95 flex items-center justify-center gap-1.5 hover:bg-coral/10 transition-all">
          <span class="material-symbols-outlined text-[15px]">logout</span> Keluar / Ganti Akun Pengguna
        </button>
      </div>

    </div>


    <!-- ======================================================================= -->
    <!--  NAVBAR -->
    <nav 
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
