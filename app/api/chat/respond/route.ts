import { NextRequest, NextResponse } from 'next/server';
import { processChatRespondDirect } from '@/lib/telegram/chat-processor';

export async function POST(req: NextRequest) {
  // Fix #13: Internal secret header authentication
  const internalSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const authHeader = req.headers.get('x-internal-secret');

  if (internalSecret && authHeader !== internalSecret) {
    return NextResponse.json({ error: 'Unauthorized internal request' }, { status: 401 });
  }

  try {
    const { userId, chatId, userMessage, userName } = await req.json();

    if (!userId || !userMessage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Delegate to single source of truth processor (Fix #1)
    await processChatRespondDirect(userId, chatId, userMessage, userName);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error in chat/respond endpoint:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
