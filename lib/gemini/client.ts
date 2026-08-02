import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

export const ai = new GoogleGenAI({ apiKey });
export const DEFAULT_MODEL = 'gemini-3.6-flash';
export const EMBEDDING_MODEL = 'text-embedding-004';

export async function generateCategoryEmbedding(text: string): Promise<number[]> {
  try {
    const response: any = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text,
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
