import { NextRequest, NextResponse } from 'next/server';
import { processReceiptDirect } from '@/lib/telegram/receipt-processor';

export async function POST(req: NextRequest) {
  // Fix #13: Internal secret header authentication
  const internalSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const authHeader = req.headers.get('x-internal-secret');

  if (internalSecret && authHeader !== internalSecret) {
    return NextResponse.json({ error: 'Unauthorized internal request' }, { status: 401 });
  }

  try {
    const { userId, chatId, fileId } = await req.json();

    if (!fileId || !userId) {
      return NextResponse.json({ error: 'Missing fileId or userId' }, { status: 400 });
    }

    const tx = await processReceiptDirect(userId, chatId, fileId);

    return NextResponse.json({ ok: true, transaction: tx });
  } catch (error: any) {
    console.error('Error processing receipt:', error);
    return NextResponse.json({ error: error.message || 'Failed to process receipt' }, { status: 500 });
  }
}
