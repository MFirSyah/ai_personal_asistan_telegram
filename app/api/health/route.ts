import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  try {
    return NextResponse.json({
      status: 'ok',
      system: 'AI Personal Assistant Telegram & Mobile',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage().heapUsed
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err?.message || 'Health check error' }, { status: 500 });
  }
}
