import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

export const ai = new GoogleGenAI({ apiKey });

// Official Google Gemini model identifiers
export const PRIMARY_MODEL = 'gemini-2.5-flash';
export const FALLBACK_MODEL = 'gemini-2.0-flash';
export const TERTIARY_MODEL = 'gemini-1.5-flash';
export const DEFAULT_MODEL = PRIMARY_MODEL;
export const EMBEDDING_MODEL = 'text-embedding-004';

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
