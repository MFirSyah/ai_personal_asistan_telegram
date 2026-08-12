export const APP_CONFIG = {
  APP_NAME: 'AI Personal Assistant Telegram',
  DEFAULT_TIMEZONE: 'Asia/Jakarta',
  DEFAULT_LOCALE: 'id-ID',

  // Rate Limiting
  RATE_LIMIT: {
    MAX_DAILY: 700,
    MAX_PER_MINUTE: 15,
  },

  // Financial Defaults
  FINANCIAL: {
    DEFAULT_SAFE_DAILY_LIMIT: 100000,
    SAVINGS_RATIO_TARGET: 0.3, // 30%
    MAX_TRANSACTION_AMOUNT: 100_000_000_000, // 100 Billion IDR
  },

  // Pagination & Limits
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 200,
    RECENT_TRANSACTIONS_LIMIT: 10,
    RECENT_ACTIVITIES_LIMIT: 50,
    RECENT_PREFERENCES_LIMIT: 20,
    RECENT_CHAT_HISTORY_LIMIT: 24,
  },

  // Cron & Batching
  BATCH: {
    CHUNK_SIZE: 4,
    GEMINI_TIMEOUT_MS: 15000,
  },

  // Email Config
  EMAIL: {
    DEFAULT_BRIEFING_TIME: '07:00:00',
  },
} as const;
