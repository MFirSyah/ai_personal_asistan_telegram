import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

export const ai = new GoogleGenAI({ apiKey });

// Model chain yang eksklusif hanya menggunakan seri Lite berkuota tinggi (500 RPD & 15 RPM)
export const MODEL_FALLBACK_CHAIN = [
  'gemini-3.5-flash-lite', // Model Utama (500 RPD)
  'gemini-3.1-flash-lite', // Model Cadangan (500 RPD)
];

export const PRIMARY_MODEL = MODEL_FALLBACK_CHAIN[0];
export const DEFAULT_MODEL = PRIMARY_MODEL;
export const EMBEDDING_MODEL = 'text-embedding-004';

/**
 * Memanggil Gemini API dengan Multi-Model Fallback otomatis.
 * Jika model utama sibuk (503/429/Timeout), sistem langsung berganti ke model berikutnya dalam rantai.
 */
export async function generateContentWithFallback(
  contents: any,
  config?: any,
  timeoutMs = 15_000
): Promise<{ response: any; usedModel: string }> {
  let lastError: any = null;

  for (const model of MODEL_FALLBACK_CHAIN) {
    try {
      let timer: ReturnType<typeof setTimeout>;
      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`TIMEOUT model ${model}`)), timeoutMs);
      });

      const apiCall = ai.models.generateContent({
        model,
        contents,
        config: config || { responseMimeType: 'application/json' },
      });

      const response: any = await Promise.race([apiCall, timeoutPromise]);
      clearTimeout(timer!);
      return { response, usedModel: model };
    } catch (err: any) {
      lastError = err;
      const errStr = String(err?.message || err || '');
      console.warn(`[Gemini API Multi-Model] Model ${model} mengalami kendala: ${errStr}. Mencoba model berikutnya...`);
    }
  }

  throw lastError;
}

export async function generateCategoryEmbedding(text: string): Promise<number[]> {
  if (!text || !text.trim()) return [];
  try {
    const response: any = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text.trim(),
    });

    if (response?.embedding?.values) {
      return response.embedding.values;
    }
    if (response?.embeddings?.[0]?.values) {
      return response.embeddings[0].values;
    }
    return [];
  } catch (error) {
    console.error('Error generating embedding:', error);
    return [];
  }
}

