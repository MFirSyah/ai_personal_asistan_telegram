export interface BriefingEmailData {
  userName: string;
  todayDateStr: string;
  safeDailyLimit?: number;
  totalIncome?: number;
  totalExpense?: number;
  todayActs?: string[];
  urgentActs?: string[];
  upcomingActs?: string[];
  aiInsight?: string;
  dashboardUrl?: string;
}

export function generateBriefingHtmlEmail(data: BriefingEmailData): string {
  const {
    userName = 'Teman',
    todayDateStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    safeDailyLimit = 100000,
    totalIncome = 0,
    totalExpense = 0,
    todayActs = [],
    urgentActs = [],
    upcomingActs = [],
    aiInsight = '',
    dashboardUrl = 'https://ai-personal-asistan-telegram.vercel.app/dashboard',
  } = data;

  const formattedLimit = (safeDailyLimit / 1000).toFixed(0);
  const formattedIncome = totalIncome.toLocaleString('id-ID');
  const formattedExpense = totalExpense.toLocaleString('id-ID');

  const todayActsHtml =
    todayActs.length > 0
      ? todayActs.map((act) => `<li style="margin-bottom: 6px; padding: 6px 10px; background-color: #f9f9f9; border-left: 4px solid #008080; font-weight: bold;">📅 ${escapeHtml(act)}</li>`).join('')
      : `<li style="color: #888888; font-style: italic;">Tidak ada agenda terjadwal hari ini.</li>`;

  const urgentActsHtml =
    urgentActs.length > 0
      ? urgentActs.map((act) => `<li style="margin-bottom: 6px; padding: 6px 10px; background-color: #ffdad6; border-left: 4px solid #ba1a1a; color: #93000a; font-weight: bold;">🚨 ${escapeHtml(act)}</li>`).join('')
      : `<li style="color: #888888; font-style: italic;">Semua lancar, tidak ada tugas urgent.</li>`;

  const upcomingActsHtml =
    upcomingActs.length > 0
      ? upcomingActs.map((act) => `<li style="margin-bottom: 4px; color: #444444;">📌 ${escapeHtml(act)}</li>`).join('')
      : `<li style="color: #888888; font-style: italic;">Tidak ada agenda mendatang 7 hari ke depan.</li>`;

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Morning Briefing Harian - DATA_CORE_V1</title>
</head>
<body style="margin: 0; padding: 0; background-color: #e5e5e5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1c1c;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #e5e5e5; padding: 20px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border: 4px solid #000000; box-shadow: 8px 8px 0px 0px #000000;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #006565; color: #ffffff; padding: 24px 20px; border-bottom: 4px solid #000000;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px;">
                      💻 DATA_CORE_V1
                    </h1>
                    <p style="margin: 4px 0 0 0; font-size: 12px; font-family: monospace; font-weight: bold; color: #d2f000; text-transform: uppercase;">
                      ☀️ MORNING BRIEFING HARIAN — ${todayDateStr}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting Section -->
          <tr>
            <td style="padding: 24px 20px 12px 20px;">
              <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 800; text-transform: uppercase;">
                Halo, ${escapeHtml(userName)}! 👋
              </h2>
              <p style="margin: 0; font-size: 14px; color: #444444; line-height: 1.5;">
                Berikut adalah ringkasan pagi harian yang disusun khusus oleh asisten personal pintar untuk membantu aktivitas & keuanganmu hari ini.
              </p>
            </td>
          </tr>

          <!-- Financial Snapshot Section -->
          <tr>
            <td style="padding: 12px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f9f9f9; border: 3px solid #000000; padding: 16px;">
                <tr>
                  <td style="border-bottom: 2px solid #000000; padding-bottom: 8px; margin-bottom: 12px;">
                    <p style="margin: 0; font-size: 11px; font-family: monospace; font-weight: bold; text-transform: uppercase; color: #008080;">
                      📊 FINANSUAL SNAPSHOT HARIAN
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="50%" style="padding-right: 8px;">
                          <div style="background-color: #008080; color: #ffffff; padding: 12px; border: 2px solid #000000;">
                            <p style="margin: 0; font-size: 10px; font-family: monospace; text-transform: uppercase; font-weight: bold;">Sisa Uang Aman / Hari</p>
                            <p style="margin: 4px 0 0 0; font-size: 22px; font-weight: 900;">Rp ${formattedLimit}k</p>
                          </div>
                        </td>
                        <td width="50%" style="padding-left: 8px;">
                          <div style="background-color: #ffffff; color: #1a1c1c; padding: 12px; border: 2px solid #000000;">
                            <p style="margin: 0; font-size: 10px; font-family: monospace; text-transform: uppercase; font-weight: bold; color: #555555;">Pemasukan vs Pengeluaran</p>
                            <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: bold; color: #008080;">+Rp ${formattedIncome}</p>
                            <p style="margin: 2px 0 0 0; font-size: 12px; font-weight: bold; color: #ba1a1a;">-Rp ${formattedExpense}</p>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Agenda & Urgent Section -->
          <tr>
            <td style="padding: 12px 20px;">
              <!-- Today Agenda Box -->
              <div style="border: 3px solid #000000; margin-bottom: 16px; background-color: #ffffff;">
                <div style="background-color: #536000; color: #ffffff; padding: 10px 14px; font-size: 12px; font-family: monospace; font-weight: bold; text-transform: uppercase; border-bottom: 3px solid #000000;">
                  📅 Agenda & Jadwal Hari Ini
                </div>
                <div style="padding: 14px;">
                  <ul style="margin: 0; padding: 0; list-style: none; font-size: 13px;">
                    ${todayActsHtml}
                  </ul>
                </div>
              </div>

              <!-- Urgent Attention Box -->
              <div style="border: 3px solid #000000; background-color: #ffffff;">
                <div style="background-color: #ba1a1a; color: #ffffff; padding: 10px 14px; font-size: 12px; font-family: monospace; font-weight: bold; text-transform: uppercase; border-bottom: 3px solid #000000;">
                  🚨 Perhatian Khusus & Tugas Urgent
                </div>
                <div style="padding: 14px;">
                  <ul style="margin: 0; padding: 0; list-style: none; font-size: 13px;">
                    ${urgentActsHtml}
                  </ul>
                </div>
              </div>
            </td>
          </tr>

          <!-- AI Insight / Recommendation Box (Lime Accent) -->
          ${
            aiInsight
              ? `
          <tr>
            <td style="padding: 12px 20px;">
              <div style="background-color: #d2f000; color: #000000; border: 3px solid #000000; padding: 16px; box-shadow: 4px 4px 0px 0px #000000;">
                <p style="margin: 0 0 6px 0; font-size: 11px; font-family: monospace; font-weight: bold; text-transform: uppercase;">
                  💡 REKOMENDASI PINTAR AI:
                </p>
                <p style="margin: 0; font-size: 13px; font-weight: bold; line-height: 1.4;">
                  "${escapeHtml(aiInsight)}"
                </p>
              </div>
            </td>
          </tr>
          `
              : ''
          }

          <!-- Upcoming Agenda 7 Days -->
          <tr>
            <td style="padding: 12px 20px;">
              <div style="background-color: #f4f4f4; border: 2px border-dashed #888888; padding: 12px 16px;">
                <p style="margin: 0 0 8px 0; font-size: 11px; font-family: monospace; font-weight: bold; text-transform: uppercase; color: #555555;">
                  📆 Agenda Mendatang (7 Hari):
                </p>
                <ul style="margin: 0; padding-left: 16px; font-size: 12px;">
                  ${upcomingActsHtml}
                </ul>
              </div>
            </td>
          </tr>

          <!-- CTA Button Section -->
          <tr>
            <td style="padding: 20px; text-align: center;">
              <a href="${dashboardUrl}" target="_blank" style="display: inline-block; background-color: #008080; color: #ffffff; font-size: 14px; font-family: monospace; font-weight: bold; text-transform: uppercase; text-decoration: none; padding: 14px 28px; border: 3px solid #000000; box-shadow: 4px 4px 0px 0px #000000;">
                🚀 Buka Web Dashboard Data Core →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 16px 20px; border-top: 3px solid #000000; text-align: center; font-size: 11px; color: #666666; font-family: monospace;">
              <p style="margin: 0 0 6px 0;">
                Email ini dikirim otomatis oleh <strong>DATA_CORE_V1 Assistant</strong>.
              </p>
              <p style="margin: 0;">
                Atur preferensi email & notifikasi di <a href="${dashboardUrl}/settings" style="color: #008080; font-weight: bold; text-decoration: underline;">Pengaturan Akun</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
