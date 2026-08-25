export function buildDashboardInlineKeyboard(webAppUrl: string) {
  return {
    inline_keyboard: [
      [
        {
          text: '📊 Buka Dashboard Keuangan',
          web_app: { url: webAppUrl },
        },
      ],
    ],
  };
}

export function buildConfirmationInlineKeyboard(confirmCallbackData: string, cancelCallbackData = 'cancel') {
  return {
    inline_keyboard: [
      [
        {
          text: '✅ Ya, Lanjutkan',
          callback_data: confirmCallbackData,
        },
        {
          text: '❌ Batal',
          callback_data: cancelCallbackData,
        },
      ],
    ],
  };
}

export function buildQuickActionKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '💵 Cek Saldo', callback_data: 'qa_saldo' },
        { text: '🏔️ Plan Dieng', callback_data: 'qa_dieng' },
        { text: '📊 Laporan', callback_data: 'qa_laporan' },
      ],
    ],
  };
}

export function buildCategoryQuickChipsKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '💵 Saldo', callback_data: 'qa_saldo' },
        { text: '🏔️ Plan Dieng', callback_data: 'qa_dieng' },
        { text: '📊 Laporan', callback_data: 'qa_laporan' },
      ],
      [
        { text: '⛽ Bensin', callback_data: 'chip_bensin' },
        { text: '🍔 Makan', callback_data: 'chip_makan' },
        { text: '🅿️ Parkir', callback_data: 'chip_parkir' },
        { text: '🛵 Gojek', callback_data: 'chip_gojek' },
      ],
    ],
  };
}
