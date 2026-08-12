import { NextRequest, NextResponse } from 'next/server';
import { generateExportFile } from '@/lib/export/export-data';
import { verifyApiUser } from '@/lib/auth/verify-auth';

export async function GET(req: NextRequest) {
  const { authenticated, user, errorResponse } = await verifyApiUser(req);
  if (!authenticated || !user) {
    return errorResponse || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const target = (searchParams.get('target') as any) || 'all';

  try {
    const exportResult = await generateExportFile(user.id, { target });

    return new NextResponse(new Uint8Array(exportResult.buffer), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${exportResult.filename}"`,
      },
    });
  } catch (err: any) {
    console.error('Export API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
