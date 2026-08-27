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
      background: rgba(20, 26, 32, 0.92);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(40, 50, 62, 0.7);
    }
    .tosca-bloom { box-shadow: 0 0 16px rgba(0, 168, 168, 0.35); }
    .lime-glow { box-shadow: 0 0 16px rgba(210, 240, 0, 0.4); }
    .tab-pane {
      display: none;
      width: 100%;
      height: 100%;
      overflow-y: auto;
      padding-bottom: 120px;
    }
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
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
  <!-- 🔝 TOP APP BAR (HEADER BERSIH DENGAN STATUS & SALDO CEPAT) -->
  <!-- ========================================================================= -->
  <header class="glass-panel px-4 py-3 flex justify-between items-center border-b border-border/50 shrink-0 z-40">
    <div class="flex items-center gap-2.5">
      <div class="relative">
        <div class="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center border border-primary/40 tosca-bloom">
          <span class="material-symbols-outlined text-primary text-[18px]">smart_toy</span>
        </div>
        <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-lime rounded-full border-2 border-background animate-pulse"></div>
      </div>
      <div>
        <h1 class="font-headline font-bold text-sm leading-tight flex items-center gap-1.5 text-text-primary">
          DATA_CORE_V1
          <span class="text-[9px] font-mono px-1 rounded bg-primary/20 text-primary border border-primary/30">PRO</span>
        </h1>
        <p class="text-[10px] font-mono text-lime flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-lime inline-block"></span> MAS FIRMAN
        </p>
      </div>
    </div>

    <!-- Quick Balance Pill -->
    <div class="glass-panel px-2.5 py-1 rounded-full flex items-center gap-2 border border-border/60">
      <div class="flex items-center gap-1">
        <span class="text-[9px] font-mono text-text-secondary">KAS</span>
        <span class="text-[11px] font-mono font-bold text-lime">Rp 455k</span>
      </div>
      <span class="w-px h-2.5 bg-border"></span>
      <div class="flex items-center gap-1">
        <span class="text-[9px] font-mono text-text-secondary">GOPAY</span>
        <span class="text-[11px] font-mono font-bold text-tosca">Rp 164k</span>
      </div>
    </div>
  </header>

  <!-- ========================================================================= -->
  <!-- 📱 MAIN VIEW CANVAS (5 ISOLATED INDEPENDENT TABS) -->
  <!-- ========================================================================= -->
  <main class="flex-1 overflow-hidden relative w-full">

    <!-- ======================================================================= -->
    <!-- 📊 TAB 1: ANALYTICS & SMART INSIGHTS -->
    <!-- ======================================================================= -->
    <div id="tab-analytics" class="tab-pane px-4 py-3 space-y-3">
      <div class="flex justify-between items-center">
        <h2 class="font-headline font-bold text-base text-text-primary">Analisis Keuangan & Aktivitas</h2>
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
            <div class="flex justify-between text-[9px] text-text-secondary">
              <span>Tenor: Sisa 11 Bulan</span>
              <span>Autodebet Bank Jago</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================================= -->
    <!-- 🗄️ TAB 2: DATA CORE & GANTT TIMELINE (FULL CRUD) -->
    <!-- ======================================================================= -->
    <div id="tab-data" class="tab-pane px-4 py-3 space-y-3">
      <div class="flex justify-between items-center">
        <h2 class="font-headline font-bold text-base text-text-primary">Data Core & Timeline</h2>
        <div class="flex gap-1.5">
          <button onclick="openAddModal()" class="px-2.5 py-1 bg-lime text-black font-mono font-bold text-[10px] rounded-lg flex items-center gap-1 shadow-md">
            <span class="material-symbols-outlined text-[14px]">add</span> Tambah
          </button>
          <button onclick="exportToExcel()" class="px-2 py-1 bg-primary/20 border border-primary text-primary text-[10px] font-mono font-bold rounded-lg flex items-center gap-1">
            <span class="material-symbols-outlined text-[12px]">download</span> Excel
          </button>
        </div>
      </div>

      <!-- Segmented Switcher -->
      <div class="flex bg-surface-elevated p-1 rounded-xl border border-border">
        <button id="sub-btn-gantt" onclick="switchDataSubView('gantt')" class="flex-1 py-1.5 rounded-lg text-[11px] font-mono font-bold bg-primary text-black transition-all">
          📅 Agenda & Gantt
        </button>
        <button id="sub-btn-ledger" onclick="switchDataSubView('ledger')" class="flex-1 py-1.5 rounded-lg text-[11px] font-mono font-bold text-text-secondary hover:text-text-primary transition-all">
          💳 Transaksi
        </button>
      </div>

      <!-- Gantt Sub-view -->
      <div id="sub-view-gantt" class="space-y-2.5">
        <div class="bg-surface rounded-xl p-3 border border-border space-y-2.5">
          <div class="flex justify-between items-center text-[10px] font-mono text-text-secondary border-b border-border/50 pb-1.5">
            <span class="font-bold text-text-primary">GANTT TIMELINE 2026</span>
            <span class="text-lime">HARI INI: 27 AGUSTUS</span>
          </div>

          <div class="space-y-2">
            <div class="p-2.5 bg-surface-elevated rounded-lg border border-border space-y-1">
              <div class="flex justify-between items-center">
                <span class="font-bold text-text-primary text-[11px] flex items-center gap-1">
                  <span class="material-symbols-outlined text-tosca text-[14px]">landscape</span> Trip ke Dieng (29-30 Ags)
                </span>
                <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-tosca/20 text-tosca border border-tosca/30 font-bold">50% PREP</span>
              </div>
              <div class="w-full h-2 bg-surface rounded-full overflow-hidden">
                <div class="h-full bg-tosca rounded-full" style="width: 50%"></div>
              </div>
              <div class="flex justify-between text-[9px] font-mono text-text-secondary">
                <span>🗓️ 29 s/d 30 Agustus 2026</span>
                <span>Sisa: Rp 740.000</span>
              </div>
            </div>

            <div class="p-2.5 bg-surface-elevated rounded-lg border border-border space-y-1">
              <div class="flex justify-between items-center">
                <span class="font-bold text-text-primary text-[11px] flex items-center gap-1">
                  <span class="material-symbols-outlined text-amber text-[14px]">two_wheeler</span> Narik Gojek Rutin
                </span>
                <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber/20 text-amber border border-amber/30 font-bold">TERJADWAL</span>
              </div>
              <div class="w-full h-2 bg-surface rounded-full overflow-hidden">
                <div class="h-full bg-amber rounded-full" style="width: 35%"></div>
              </div>
              <div class="flex justify-between text-[9px] font-mono text-text-secondary">
                <span>🗓️ Harian Kota Malang</span>
                <span>Target: Rp 150.000 / hari</span>
              </div>
            </div>

            <div class="p-2.5 bg-surface-elevated rounded-lg border border-border space-y-1">
              <div class="flex justify-between items-center">
                <span class="font-bold text-text-primary text-[11px] flex items-center gap-1">
                  <span class="material-symbols-outlined text-emerald text-[14px]">school</span> Wisuda Telkom University
                </span>
                <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald/20 text-emerald border border-emerald/30 font-bold">SELESAI (100%)</span>
              </div>
              <div class="w-full h-2 bg-surface rounded-full overflow-hidden">
                <div class="h-full bg-emerald rounded-full" style="width: 100%"></div>
              </div>
              <div class="flex justify-between text-[9px] font-mono text-text-secondary">
                <span>🗓️ 12 Agustus 2026</span>
                <span>Status: Sukses Selesai</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ledger Sub-view -->
      <div id="sub-view-ledger" class="space-y-2" style="display: none;">
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
    <!-- 🔔 TAB 4: NOTIFICATIONS & SMART ALERTS -->
    <!-- ======================================================================= -->
    <div id="tab-notifications" class="tab-pane px-4 py-3 space-y-2.5">
      <h2 class="font-headline font-bold text-base text-text-primary">Pusat Notifikasi & Pengingat</h2>

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

      <!-- Weather Alert: Malang -->
      <div class="bg-surface rounded-xl p-3 border-l-4 border-tosca border border-border space-y-1.5">
        <div class="flex justify-between items-center">
          <span class="text-[10px] font-mono font-bold text-tosca flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">partly_cloudy_day</span> CUACA KOTA MALANG
          </span>
          <span class="text-[9px] font-mono text-lime font-bold">REALTIME</span>
        </div>
        <div class="flex items-center gap-2.5">
          <span class="text-xl font-mono font-bold text-text-primary">26°C</span>
          <p class="text-[11px] text-text-secondary">Cerah Berawan • Suhu ideal untuk narik Gojek sore ini.</p>
        </div>
      </div>
    </div>

    <!-- ======================================================================= -->
    <!-- ⚙️ TAB 5: PROFILE & SETTINGS (LENGKAP) -->
    <!-- ======================================================================= -->
    <div id="tab-profile" class="tab-pane px-4 py-3 space-y-3">
      <h2 class="font-headline font-bold text-base text-text-primary">Profil & Pengaturan Sistem</h2>

      <!-- User Badge -->
      <div class="bg-surface rounded-xl p-3.5 border border-border flex items-center gap-3">
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

      <!-- Security Protocol -->
      <div class="bg-surface rounded-xl p-3 border border-border border-l-4 border-l-primary space-y-0.5 text-[10px]">
        <span class="font-mono text-primary font-bold flex items-center gap-1">
          <span class="material-symbols-outlined text-[12px]">lock</span> PRIVASI 100% TERKUNCI
        </span>
        <p class="text-text-secondary leading-relaxed">
          Mode Privat Mas Firman aktif. Akses pengguna lain telah diblokir secara permanen dari server dan database.
        </p>
      </div>
    </div>

  </main>

  <!-- ========================================================================= -->
  <!-- 💬 CHAT INPUT DOCK (HANYA TERLIHAT PADA TAB 3) -->
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
      <button onclick="sendQuickAction('tampilkan gantt chart kegiatan saya')" class="shrink-0 bg-surface-elevated hover:bg-surface-high border border-border px-2.5 py-1 rounded-full text-[10px] font-mono flex items-center gap-1 text-primary">
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
  <!-- 📝 MODAL DIALOG: TAMBAH DATA (TRANSAKSI / AGENDA) -->
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
  <!-- ⚡ CLIENT-SIDE APPLICATION SCRIPT (100% ISOLATED TAB CONTROLLER) -->
  <!-- ========================================================================= -->
  <script>
    const USER_ID = "fc2758d3-78bb-4e22-b9f0-b3b16568b671";
    const API_BASE = "https://ai-personal-asistan-telegram.vercel.app";
    let cachedTransactions = [];

    function switchTab(tabId) {
      const allTabs = ['analytics', 'data', 'chat', 'notifications', 'profile'];
      
      // 100% Isolate: Hide all other tab panes completely
      allTabs.forEach(t => {
        const pane = document.getElementById('tab-' + t);
        if (pane) {
          pane.style.display = (t === tabId) ? 'block' : 'none';
        }
      });

      // Show chat input dock only on Tab 3 (chat)
      const chatInputWrapper = document.getElementById('chat-input-wrapper');
      if (chatInputWrapper) {
        chatInputWrapper.style.display = (tabId === 'chat') ? 'block' : 'none';
      }

      // Update bottom nav bar buttons
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
    }

    function switchDataSubView(sub) {
      const vGantt = document.getElementById('sub-view-gantt');
      const vLedger = document.getElementById('sub-view-ledger');
      const btnGantt = document.getElementById('sub-btn-gantt');
      const btnLedger = document.getElementById('sub-btn-ledger');

      if (sub === 'gantt') {
        vGantt.style.display = 'block';
        vLedger.style.display = 'none';
        btnGantt.className = "flex-1 py-1.5 rounded-lg text-[11px] font-mono font-bold bg-primary text-black transition-all";
        btnLedger.className = "flex-1 py-1.5 rounded-lg text-[11px] font-mono font-bold text-text-secondary hover:text-text-primary transition-all";
      } else {
        vGantt.style.display = 'none';
        vLedger.style.display = 'block';
        btnLedger.className = "flex-1 py-1.5 rounded-lg text-[11px] font-mono font-bold bg-primary text-black transition-all";
        btnGantt.className = "flex-1 py-1.5 rounded-lg text-[11px] font-mono font-bold text-text-secondary hover:text-text-primary transition-all";
        loadLedgerData();
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
        <div id="\${typingId}" class="flex items-center gap-1.5 text-[10px] font-mono text-lime animate-pulse">
          <span class="material-symbols-outlined text-[14px]">smart_toy</span> Butler sedang memproses analisis...
        </div>
      \`;
      const tabChat = document.getElementById('tab-chat');
      tabChat.scrollTop = tabChat.scrollHeight;

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
      const tabChat = document.getElementById('tab-chat');
      tabChat.scrollTop = tabChat.scrollHeight;
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
      const tabChat = document.getElementById('tab-chat');
      tabChat.scrollTop = tabChat.scrollHeight;
    }

    async function loadLedgerData() {
      const c = document.getElementById('ledger-list-container');
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
