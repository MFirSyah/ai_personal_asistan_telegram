import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

export const ai = new GoogleGenAI({ apiKey });

// Model chain yang eksklusif hanya menggunakan seri Lite berkuota tinggi (500 RPD & 15 RPM)
export const MODEL_FALLBACK_CHAIN = [
  'gemini-3.5-flash-lite', // Model Utama Ultra-Fast (500 RPD & 15 RPM)
  'gemini-3.1-flash-lite', // Model Cadangan Lite (500 RPD)
  'gemini-3.6-flash',      // Model Cadangan Flagship (Vision & Deep Reasoning)
  'gemini-3.5-flash',      // Model Cadangan Kapasitas Tinggi
];

export const PRIMARY_MODEL = MODEL_FALLBACK_CHAIN[0];
export const DEFAULT_MODEL = PRIMARY_MODEL;
export const EMBEDDING_MODEL = 'text-embedding-004';

// In-memory request log for RPM & RPD tracking
const requestTimestamps: number[] = [];

export interface ModelQuotaInfo {
  model: string;
  displayName: string;
  rpmLimit: number;
  rpdLimit: number;
  rpmUsed: number;
  rpdUsed: number;
  rpmRemaining: number;
  rpdRemaining: number;
}

export function recordApiRequest(): void {
  const now = Date.now();
  requestTimestamps.push(now);
  // Clean logs older than 24 hours (86,400,000 ms)
  const cutoff = now - 24 * 60 * 60 * 1000;
  while (requestTimestamps.length > 0 && requestTimestamps[0] < cutoff) {
    requestTimestamps.shift();
  }
}

export function getModelQuotaStatus(modelName = PRIMARY_MODEL): ModelQuotaInfo {
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;
  const startOfDay = new Date().setHours(0, 0, 0, 0);

  const rpmUsed = requestTimestamps.filter(t => t >= oneMinuteAgo).length;
  const rpdUsed = requestTimestamps.filter(t => t >= startOfDay).length;

  const rpmLimit = 15;
  const rpdLimit = 500;

  let displayName = modelName;
  if (modelName.includes('3.5-flash-lite')) displayName = 'Gemini 3.5 Flash-Lite';
  else if (modelName.includes('3.1-flash-lite')) displayName = 'Gemini 3.1 Flash-Lite';
  else if (modelName.includes('3.6-flash')) displayName = 'Gemini 3.6 Flash (Flagship)';
  else if (modelName.includes('3.5-flash')) displayName = 'Gemini 3.5 Flash';

  return {
    model: modelName,
    displayName,
    rpmLimit,
    rpdLimit,
    rpmUsed,
    rpdUsed,
    rpmRemaining: Math.max(0, rpmLimit - rpmUsed),
    rpdRemaining: Math.max(0, rpdLimit - rpdUsed),
  };
}

/**
 * Memanggil Gemini API dengan Multi-Model Fallback otomatis.
 * Jika model utama sibuk (503/429/Timeout), sistem langsung berganti ke model berikutnya dalam rantai.
 */
export async function generateContentWithFallback(
  contents: any,
  config?: any,
  timeoutMs = 8_000
): Promise<{ response: any; usedModel: string }> {
  let lastError: any = null;

  for (const model of MODEL_FALLBACK_CHAIN) {
    let timer: ReturnType<typeof setTimeout> | null = null;
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`TIMEOUT model ${model}`)), timeoutMs);
      });

      const apiCall = ai.models.generateContent({
        model,
        contents,
        config: config || { responseMimeType: 'application/json' },
      });

      const response: any = await Promise.race([apiCall, timeoutPromise]);
      recordApiRequest();
      return { response, usedModel: model };
    } catch (err: any) {
      lastError = err;
      const errStr = String(err?.message || err || '');
      console.warn(`[Gemini API Multi-Model] Model ${model} mengalami kendala: ${errStr}. Mencoba model berikutnya...`);
    } finally {
      if (timer) clearTimeout(timer);
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

