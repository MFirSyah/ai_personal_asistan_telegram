import { generateContentWithFallback } from '../client';

export interface ReceiptItem {
  name: string;
  price: number;
  quantity?: number;
}

export interface OCRReceiptResult {
  merchant?: string;
  items: ReceiptItem[];
  totalAmount: number;
  date?: string;
  needs_review: boolean;
  rawResponse: any;
}

export async function processReceiptImage(
  imageBuffer: Buffer,
  mimeType = 'image/jpeg'
): Promise<OCRReceiptResult> {
  const base64Data = imageBuffer.toString('base64');

  const prompt = `
Analisis foto struk/nota pembayaran ini secara teliti.
Ekstraksi data berikut dalam format JSON:
- merchant (nama toko/restoran/penjual)
- date (tanggal transaksi format YYYY-MM-DD jika terbaca)
- items (daftar barang dengan name, price, quantity)
- totalAmount (total akhir pembayaran yang tertera di struk)

Format JSON:
{
  "merchant": "Nama Toko",
  "date": "2026-08-02",
  "items": [
    { "name": "Barang A", "price": 15000, "quantity": 1 }
  ],
  "totalAmount": 15000
}
`;

  try {
    const { response, usedModel } = await generateContentWithFallback(
      [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
      {
        responseMimeType: 'application/json',
      },
      20_000
    );
    console.log(`[OCR Receipt] Processed successfully using model: ${usedModel}`);

    const parsed = JSON.parse(response.text || '{}');

    const items: ReceiptItem[] = Array.isArray(parsed.items) ? parsed.items : [];
    const calculatedSum = items.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
    const declaredTotal = Number(parsed.totalAmount) || calculatedSum;

    // Check mismatch (>5% deviation between item sum and total declared)
    const needs_review =
      calculatedSum > 0 && declaredTotal > 0 && Math.abs(calculatedSum - declaredTotal) > 10;

    return {
      merchant: parsed.merchant || 'Struk Belanja',
      items,
      totalAmount: declaredTotal,
      date: parsed.date || new Date().toISOString(),
      needs_review,
      rawResponse: parsed,
    };
  } catch (error) {
    console.error('OCR Receipt prompt error:', error);
    return {
      merchant: 'Struk (Gagal Dibaca)',
      items: [],
      totalAmount: 0,
      needs_review: true,
      rawResponse: null,
    };
  }
}
