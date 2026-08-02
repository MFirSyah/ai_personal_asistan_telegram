const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie';
  title?: string;
  labels: string[];
  datasets: { label: string; data: number[] }[];
}

export function generateQuickChartUrl(config: ChartConfig): string {
  const chartJsConfig = {
    type: config.type,
    data: {
      labels: config.labels,
      datasets: config.datasets.map((ds) => ({
        label: ds.label,
        data: ds.data,
      })),
    },
    options: {
      title: {
        display: Boolean(config.title),
        text: config.title || '',
      },
    },
  };

  const encodedConfig = encodeURIComponent(JSON.stringify(chartJsConfig));
  return `https://quickchart.io/chart?c=${encodedConfig}&w=500&h=300&bkg=white`;
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
    return await res.json();
  } catch (error) {
    console.error('Failed to send Telegram chart photo:', error);
    return null;
  }
}
