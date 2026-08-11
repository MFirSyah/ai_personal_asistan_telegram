const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie';
  title?: string;
  labels: string[];
  datasets: { label: string; data: number[] }[];
}

const MODERN_PALETTE = [
  '#6366f1', // Indigo / Electric Royal Blue
  '#10b981', // Emerald Green
  '#f43f5e', // Vibrant Rose Pink
  '#f59e0b', // Warm Amber Gold
  '#06b6d4', // Bright Cyan Teal
  '#8b5cf6', // Deep Violet
  '#ec4899', // Hot Pink
  '#3b82f6', // Ocean Blue
  '#14b8a6', // Mint Turquoise
  '#f97316', // Coral Orange
];

const BORDER_PALETTE = [
  '#4f46e5',
  '#059669',
  '#e11d48',
  '#d97706',
  '#0891b2',
  '#7c3aed',
  '#db2777',
  '#2563eb',
  '#0d9488',
  '#ea580c',
];

export function generateQuickChartUrl(config: ChartConfig): string {
  const isPie = config.type === 'pie';
  const isLine = config.type === 'line';

  // Cap to top 8 items max to guarantee URL stays under 2000 chars for Telegram
  const safeLabels = (config.labels || []).slice(0, 8);

  const formattedDatasets = (config.datasets || []).map((ds, dsIndex) => {
    const safeData = (ds.data || []).slice(0, 8);
    let bgColors: string | string[];
    let borderColors: string | string[];

    if (isPie || safeLabels.length > 1) {
      bgColors = safeLabels.map((_, i) => MODERN_PALETTE[i % MODERN_PALETTE.length]);
      borderColors = safeLabels.map((_, i) => BORDER_PALETTE[i % BORDER_PALETTE.length]);
    } else {
      bgColors = MODERN_PALETTE[dsIndex % MODERN_PALETTE.length];
      borderColors = BORDER_PALETTE[dsIndex % BORDER_PALETTE.length];
    }

    if (isLine) {
      bgColors = 'rgba(99, 102, 241, 0.2)';
      borderColors = '#6366f1';
    }

    return {
      label: ds.label,
      data: safeData,
      backgroundColor: bgColors,
      borderColor: borderColors,
      borderWidth: 2,
      fill: isLine,
      tension: 0.35,
    };
  });

  const chartJsConfig = {
    type: config.type,
    data: {
      labels: safeLabels,
      datasets: formattedDatasets,
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: isPie ? 'bottom' : 'top',
          labels: {
            font: { family: 'sans-serif', size: 12, weight: 'bold' },
            padding: 15,
          },
        },
        title: {
          display: Boolean(config.title),
          text: config.title || '',
          font: { family: 'sans-serif', size: 16, weight: 'bold' },
          padding: { top: 10, bottom: 20 },
        },
      },
      scales: isPie
        ? undefined
        : {
            x: {
              grid: { display: false },
              ticks: { font: { family: 'sans-serif', size: 11 } },
            },
            y: {
              grid: { color: 'rgba(0, 0, 0, 0.05)' },
              ticks: { font: { family: 'sans-serif', size: 11 } },
              beginAtZero: true,
            },
          },
    },
  };

  const encodedConfig = encodeURIComponent(JSON.stringify(chartJsConfig));
  return `https://quickchart.io/chart?c=${encodedConfig}&w=600&h=380&bkg=white&devicePixelRatio=2`;
}

export async function sendTelegramChart(
  chatId: number | string,
  config: ChartConfig,
  caption?: string
): Promise<any> {
  try {
    if (!config || !Array.isArray(config.labels) || !Array.isArray(config.datasets)) {
      console.warn('Invalid chart config skipped:', config);
      return null;
    }

    const photoUrl = generateQuickChartUrl(config);

    if (!TELEGRAM_BOT_TOKEN) {
      console.warn(`[TELEGRAM MOCK CHART] sendTo ${chatId}: ${photoUrl}`);
      return { ok: true, mock: true };
    }

    const url = `${TELEGRAM_API_BASE}/sendPhoto`;
    const body = {
      chat_id: chatId,
      photo: photoUrl,
      caption: caption || '',
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const result = await res.json();

    if (!result.ok && caption) {
      console.warn('QuickChart sendPhoto failed, falling back to text message:', result.description);
      const { sendTelegramMessage } = await import('./send-message');
      await sendTelegramMessage(chatId, caption);
    }

    return result;
  } catch (error) {
    console.error('Failed to send Telegram chart photo:', error);
    if (caption) {
      const { sendTelegramMessage } = await import('./send-message');
      await sendTelegramMessage(chatId, caption).catch(console.error);
    }
    return null;
  }
}
