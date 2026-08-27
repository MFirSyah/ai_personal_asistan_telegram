# 🎨 DATA_CORE_V1 - MOBILE UI/UX DESIGN SYSTEM & PROMPT SPECIFICATIONS
> **Dokumen Resmi Arsitektur Desain, Color Tokens, dan Layout Wireframe untuk Google Stitch, v0, Figma AI, & Galileo AI**

---

# 📑 BAGIAN 1: PROMPT DESIGN COLOR TOKENS & DUAL-THEME SYSTEM
*(Gunakan prompt ini khusus untuk mengunci palet warna, kontras teks, Dark Mode, dan Light Mode agar tidak ada warna yang bertabrakan).*

```text
PROMPT: EXECUTIVE DUAL-THEME COLOR SYSTEM SPECIFICATION (TOSCA, BLACK, WHITE, ACCENTS)

1. BRAND & IDENTITY COLOR TOKENS:
• Primary Brand (Deep Tosca / Teal):
  - Dark Mode: #00A8A8 (Vibrant Luminescent Tosca)
  - Light Mode: #008080 (Deep Classic Executive Teal)
  - Hover / Active: #006666 (Rich Sea Teal)
• Hero Accent (Electric Cyber Lime):
  - Dark Mode: #D2F000 (Glowing Neon Lime - High Visibility)
  - Light Mode: #4D7C0F (Crisp Forest Lime - Deep Contrast)
• Core Neutrals:
  - Absolute Black: #0B0F12 (Obsidian Deep Tone)
  - Absolute White: #FFFFFF (Crisp Pure White)

2. DUAL-THEME SURFACE & ELEVATION MATRIX:
• DARK MODE (Luxury Cyberpunk Executive):
  - App Background: #0B0F12 (Obsidian Matte)
  - Card Surface Level 1: #141A20 (Dark Slate Charcoal)
  - Card Surface Level 2 (Elevated): #1C242C (Deep Steel Surface)
  - Border Lines: #28323E (Subtle Metallic Slate)
  - Text Primary (Headers & Values): #F8FAFC (98% Pure White - Maximum Legibility)
  - Text Secondary (Labels & Timestamps): #94A3B8 (Muted Slate Grey)
  - Text Dimmed / Disabled: #64748B (Medium Slate)
  - Glow / Neon Accent: rgba(0, 168, 168, 0.25) & rgba(210, 240, 0, 0.2)

• LIGHT MODE (Crisp High-Contrast Modern Slate):
  - App Background: #F8FAFC (Ultra Clean Light Slate)
  - Card Surface Level 1: #FFFFFF (Pure White Card)
  - Card Surface Level 2 (Elevated): #F1F5F9 (Soft Slate White)
  - Border Lines: #CBD5E1 (Solid Slate Border)
  - Text Primary (Headers & Values): #0F172A (Deep Slate Black - 100% Crisp)
  - Text Secondary (Labels & Timestamps): #475569 (Dark Muted Slate)
  - Text Dimmed / Disabled: #94A3B8 (Light Slate)
  - Shadows: 0 4px 20px -2px rgba(15, 23, 42, 0.08)

3. SEMANTIC FUNCTIONAL STATUS COLORS:
• Pemasukan / Selesai (Income / Success): #10B981 (Emerald Green)
• Pengeluaran / Urgent (Expense / High Priority): #EF4444 / #F43F5E (Coral Crimson)
• Terjadwal / Peringatan (Scheduled / Warning): #F59E0B (Amber Gold)
• Target Rencana / Sinking Fund (Plan Goal): #06B6D4 (Cyan Ocean)
• Info / Weather (Information / Forecast): #3B82F6 (Sky Blue)

4. DATA VISUALIZATION & CHART PALETTE:
• Chart Color 1 (Income Curve): #10B981 with 20% gradient fill
• Chart Color 2 (Expense Curve): #00A8A8 (Tosca) / #EF4444 (Coral)
• Donut Category Colors: ['#008080', '#D2F000', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6']
• Gantt Bar Fill (Completed): #10B981 (Solid Emerald)
• Gantt Bar Fill (In Progress): #00A8A8 (Tosca Glow)
• Gantt Bar Fill (Scheduled): #F59E0B (Amber Gold)

5. CONTRAST & ACCESSIBILITY RULES:
• All text elements MUST meet WCAG AAA contrast ratio (min 7:1 against background).
• Pure black text on white cards in Light Mode; Pure white text on dark cards in Dark Mode.
• Zero unreadable or washed-out text on graphs, table cells, or message bubbles.
```

---

# 📐 BAGIAN 2: PROMPT DESIGN LAYOUT & WIREFRAME ARCHITECTURE
*(Gunakan prompt ini khusus untuk menghasilkan tata letak 5 Tab Navigasi, komponen layar chat utama Telegram, tabel data, dan Gantt Chart).*

```text
PROMPT: 5-SCREEN MOBILE APP LAYOUT & INTERACTIVE WIREFRAME ARCHITECTURE

1. GLOBAL NAVIGATION ARCHITECTURE (5 BOTTOM TABS):
• Curved floating glassmorphic bottom navigation bar with 5 icons:
  * Tab 1: [📊] Analytics (Financial Analytics & AI Insights)
  * Tab 2: [🗄️] Data Core (Database Ledger & Gantt Chart Timeline)
  * Tab 3 (CENTER - HERO DEFAULT SCREEN): [💬] AI Chat Hub (Prominent elevated floating action circle with glowing Tosca/Lime halo)
  * Tab 4: [🔔] Notifications (Smart Reminders & Weather Alerts)
  * Tab 5: [⚙️] Profile (Settings, Dark/Light Mode & Sync)
• App launch behavior: Automatically opens and lands on Tab 3 (AI Chat Hub) by default.

================================================================================
2. DETAILED LAYOUT SPECS PER SCREEN:
================================================================================

--- [TAB 1: ANALYTICS & SMART INSIGHTS LAYOUT] ---
• Top Bar: Screen title "Analisis Keuangan & Aktivitas", Last update badge.
• Section 1 (Timeframe Filter): Horizontally scrollable capsule pills [Hari Ini] [7 Hari] [Bulan Ini] [90 Hari].
• Section 2 (Health Gauge): Radial Circular Gauge displaying Score "88/100" and label "Kondisi Sangat Sehat".
• Section 3 (Interactive Line Chart): Multi-curve gradient chart showing 30-day Income vs Expense trends.
• Section 4 (Category Breakdown): Donut Chart with percentage tags (Makanan, Bensin, Cicilan, Hiburan).
• Section 5 (2x2 KPI Grid):
  - Card A: Total Pemasukan (Rp 3.450.000)
  - Card B: Total Pengeluaran (Rp 2.120.000)
  - Card C: Sisa Kas Likuid (Rp 1.330.000)
  - Card D: Daily Burn Rate (Rp 68.000 / hari)
• Section 6 (AI Insights List): 2-column cards showing predictive saving tips.

--- [TAB 2: DATA CORE & GANTT TIMELINE LAYOUT] ---
• Top Segmented Controller: [ 💳 Transaksi Keuangan ] | [ 📅 Agenda & Gantt Chart ]
• View A: Gantt Chart Multi-Day Timeline:
  - Horizontal timeline grid with month & date headers (August - October 2026).
  - Multi-day horizontal activity bars:
    * "Trip ke Dieng (29-30 Ags)" [Tosca bar - 50% Progress]
    * "Narik Gojek Rutin (20 Ags)" [Amber bar - Scheduled]
    * "Wisuda Telkom University (12 Ags)" [Green bar - Completed]
  - Vertical red indicator line labeled "HARI INI (TODAY)".
• View B: Transaction Ledger Table:
  - Search input & Wallet filter chips: [Semua] [Cash Kertas] [Gopay] [SeaBank] [Bank Jago].
  - Interactive table cards with Short ID (TX-ED04A8), Category icon, Description, Amount, and Before/After balance.
  - Floating Action Button: "⚡ Export ke Excel/CSV".

--- [TAB 3: AI CHAT HUB (CENTER HERO & DEFAULT SCREEN LAYOUT)] ---
• Top Bar:
  - Butler AI Avatar with green pulse dot ("🟢 Active Butler").
  - Quick Wallet Balance Chip: "💵 Kas: Rp 455k | 📱 Gopay: Rp 164k".
  - Clear / Search icon.
• Conversational Message Feed (Telegram-Style Stream):
  - User Bubbles (Right): Rounded Tosca gradient bubble with white text ("Berapa sisa cicilan tiket Dieng?").
  - Butler AI Bubbles (Left): Elevated structured card with avatar:
    * Formatted Bold Breakdown: "• 🎯 Pagu Dieng: Rp 1.040.000 | 💰 Terbayar: Rp 300.000 | 📉 Sisa: Rp 740.000"
    * Embedded Mini Card: "⛽ Estimasi Bensin Honda Beat: 2.5L Pertalite (~125 KM)"
  - Quick Action Pills (Horizontally scrollable above bottom dock):
    [🏔️ Plan Dieng] [📊 Cek Saldo] [⛽ Hitung Bensin] [📅 Gantt Chart] [🧾 Scan Struk]
• Bottom Input Dock:
  - Elevated floating pill input bar.
  - Left icon: Attachment (+) & Camera/OCR Struk button.
  - Center: Clean text field with placeholder "Tanya asisten atau catat pengeluaran...".
  - Right icon: Microphone button for Voice STT note & Glowing Neon Send button.

--- [TAB 4: NOTIFIKASI & SMART ALERTS LAYOUT] ---
• Top Bar: Title "Pusat Notifikasi & Agenda", Filter tabs [Semua] [Tagihan] [Cuaca].
• Notification Cards Feed:
  - Urgent Card: "⚠️ Tagihan Bank Jago: Rp 67.940 (Jatuh tempo setiap tgl 20) - Sisa 11 Bulan".
  - Debt Card: "🤝 Bayar Hutang Rifky: Rp 100.000 (Jatuh tempo tgl 5)".
  - Live Weather Card: "🌤️ Cuaca Kota Malang: 26°C Cerah Berawan - Kondisi ideal narik Gojek sore ini".
  - Budget Anomaly Alert: "💡 Pengeluaran makan kemarin 35% lebih tinggi dari rata-rata".

--- [TAB 5: PROFIL & SISTEM SETTINGS LAYOUT] ---
• Header: User Card with Mas Firman Avatar, "Verified Single-User", Telegram ID: 1084842050.
• Setting Group 1 (Tampilan & Tema):
  - Segmented Theme Switcher: [ 🌙 Dark Mode ] ⇄ [ ☀️ Light Mode ] with live preview toggle.
• Setting Group 2 (Kelola Dompet):
  - List of active wallets with edit buttons (Cash Kertas Rp 152k, Gopay Rp 164k, Cash Koin Rp 9.5k, SeaBank, Bank Jago).
• Setting Group 3 (Sinkronisasi & Server):
  - Supabase Database Sync Status (🟢 Connected).
  - 24/7 Keep-Alive Monitor (🟢 Active).
• Setting Group 4 (Privasi & Keamanan):
  - "🔒 Mode Privat Eksklusif Aktif - Akses Akun Lain Dinonaktifkan".
```
