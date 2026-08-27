import { NextRequest, NextResponse } from 'next/server';
import { processReceiptImage } from '@/lib/gemini/prompts/ocr-receipt';
import { categorizeItem } from '@/lib/gemini/prompts/categorize';
import { insertTransaction } from '@/lib/supabase/queries/transactions';
import { getOrCreateCategory, getUserCategories } from '@/lib/supabase/queries/categories';

export async function POST(req: NextRequest) {
  try {
    const { userId, base64Image, mimeType } = await req.json();

    if (!userId || !base64Image) {
      return NextResponse.json({ ok: false, error: 'User ID dan file gambar struk wajib disertakan.' }, { status: 400 });
    }

    // Clean base64 string
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(cleanBase64, 'base64');

    // 1. Process image with Gemini Vision OCR
    const ocrResult = await processReceiptImage(imageBuffer, mimeType || 'image/jpeg');

    // 2. Validate extracted data
    if (ocrResult.totalAmount <= 0 && (!ocrResult.items || ocrResult.items.length === 0)) {
      return NextResponse.json({
        ok: false,
        error: 'Foto struk tidak terbaca jelas atau nominal total tidak terdeteksi. Pastikan foto struk terang dan tidak buram.'
      });
    }

    // 3. Categorize merchant
    const userCats = await getUserCategories(userId);
    const existingCatNames = userCats.map((c) => c.name);

    const catResult = await categorizeItem({
      transactionOrActivityName: `Belanja Struk: ${ocrResult.merchant || 'Toko'}`,
      merchant: ocrResult.merchant,
      description: (ocrResult.items || []).map((i) => i.name).join(', '),
      existingCategories: existingCatNames.length > 0 ? existingCatNames : ['Makanan & Minuman', 'Belanja Harian', 'Transportasi', 'Tagihan', 'Hiburan'],
    });

    const categoryName = catResult.categoryName || 'Belanja Harian';
    const category = await getOrCreateCategory(userId, categoryName);

    // 4. Save transaction to Supabase
    const tx = await insertTransaction({
      user_id: userId,
      category_id: category.id,
      amount: ocrResult.totalAmount,
      type: 'expense',
      merchant: ocrResult.merchant || 'Merchant Struk',
      description: `OCR Struk: ${(ocrResult.items || []).map((i) => `${i.name} (x${i.quantity || 1})`).join(', ')}`,
      payment_method: 'Cash Kertas',
      source: 'receipt_ocr',
      raw_ai_response: ocrResult.rawResponse,
      occurred_at: ocrResult.date || new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      receipt: {
        merchant: ocrResult.merchant || 'Merchant Struk',
        totalAmount: ocrResult.totalAmount,
        date: ocrResult.date || new Date().toISOString().split('T')[0],
        category: category.name,
        items: ocrResult.items || [],
        needs_review: ocrResult.needs_review,
        transactionId: tx?.id || null
      }
    });
  } catch (error: any) {
    console.error('Error processing mobile receipt:', error);
    return NextResponse.json({ ok: false, error: error.message || 'Gagal memproses gambar struk.' }, { status: 500 });
  }
}
