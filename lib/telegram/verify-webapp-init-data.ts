import crypto from 'crypto';

export interface TelegramWebAppData {
  user?: {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  };
  auth_date: number;
  hash: string;
}

export function verifyTelegramWebAppData(initDataString: string): {
  isValid: boolean;
  data?: TelegramWebAppData;
} {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.warn('TELEGRAM_BOT_TOKEN not set for WebApp validation');
    return { isValid: false };
  }

  try {
    const urlParams = new URLSearchParams(initDataString);
    const hash = urlParams.get('hash');

    if (!hash) return { isValid: false };

    urlParams.delete('hash');

    const dataCheckArr: string[] = [];
    urlParams.forEach((val, key) => {
      dataCheckArr.push(`${key}=${val}`);
    });

    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join('\n');

    // Secret key = HMAC_SHA256("WebAppData", botToken)
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculated hash = HMAC_SHA256(dataCheckString, secretKey)
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    const isValid = calculatedHash === hash;

    let parsedUser: any = null;
    const userParam = urlParams.get('user');
    if (userParam) {
      parsedUser = JSON.parse(userParam);
    }

    return {
      isValid,
      data: {
        user: parsedUser,
        auth_date: Number(urlParams.get('auth_date')) || 0,
        hash,
      },
    };
  } catch (error) {
    console.error('Error verifying Telegram WebApp initData:', error);
    return { isValid: false };
  }
}
