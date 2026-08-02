import { ai, DEFAULT_MODEL } from '../client';

export interface CategorizeRequest {
  transactionOrActivityName: string;
  merchant?: string;
  description?: string;
  existingCategories: string[];
}

export interface CategorizeResult {
  categoryName: string;
  isNewCategory: boolean;
  confidence: number;
}

export async function categorizeItem(req: CategorizeRequest): Promise<CategorizeResult> {
  if (req.existingCategories.length === 0) {
    return {
      categoryName: req.transactionOrActivityName.trim(),
      isNewCategory: true,
      confidence: 1.0,
    };
  }

  const prompt = `
Kamu adalah modul kategorisasi transaksi & aktivitas personal yang mengutamakan REUSE (penggunaan kembali) kategori yang sudah ada.

KATEGORI YANG SUDAH ADA MILIK USER:
${JSON.stringify(req.existingCategories)}

ITEM YANG INGIN DIKATEGORIKAN:
Nama/Deskripsi: "${req.transactionOrActivityName}"
Merchant: "${req.merchant || ''}"
Keterangan: "${req.description || ''}"

TUGAS:
Cocokkan item di atas dengan salah satu kategori yang sudah ada jika relevan (misal: "makan siang" -> "Makanan & Minuman", "beli bensin" -> "Transportasi").
HANYA usulkan kategori baru jika benar-benar tidak ada kategori existing yang cocok.

Format JSON Output:
{
  "categoryName": "Nama Kategori Terpilih",
  "isNewCategory": true / false,
  "confidence": 0.95
}
`;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      categoryName: parsed.categoryName || 'Lain-lain',
      isNewCategory: Boolean(parsed.isNewCategory),
      confidence: parsed.confidence || 0.8,
    };
  } catch (error) {
    console.error('Categorize prompt error:', error);
    return {
      categoryName: 'Lain-lain',
      isNewCategory: false,
      confidence: 0.5,
    };
  }
}
