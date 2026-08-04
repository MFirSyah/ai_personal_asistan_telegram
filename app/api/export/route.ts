import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { generateExportFile } from '@/lib/export/export-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let userId = searchParams.get('userId');
  const target = (searchParams.get('target') as any) || 'all';

  try {
    // Single-Account Auto Resolution
    if (!userId || userId === 'demo-user') {
      const { data: primaryUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .not('telegram_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (primaryUser) {
        userId = primaryUser.id;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'No user found for export' }, { status: 400 });
    }

    const exportResult = await generateExportFile(userId, { target });

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
