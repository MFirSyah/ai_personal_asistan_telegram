import { supabaseAdmin } from '../client';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  embedding?: number[];
  usage_count: number;
  created_at: string;
}

export async function getUserCategories(userId: string): Promise<Category[]> {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('id, user_id, name, usage_count, created_at')
    .eq('user_id', userId)
    .order('usage_count', { ascending: false });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data as Category[];
}

export async function matchCategoryByEmbedding(
  userId: string,
  embedding: number[],
  threshold = 0.85
): Promise<{ id: string; name: string; similarity: number } | null> {
  const { data, error } = await supabaseAdmin.rpc('match_categories', {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: 1,
    p_user_id: userId,
  });

  if (error || !data || data.length === 0) {
    return null;
  }

  return data[0];
}

export async function getOrCreateCategory(
  userId: string,
  categoryName: string,
  embedding?: number[]
): Promise<Category> {
  const cleanName = categoryName.trim();

  // Fix #12: Direct upsert using PostgreSQL ON CONFLICT (user_id, name)
  const { data, error } = await supabaseAdmin
    .from('categories')
    .upsert(
      {
        user_id: userId,
        name: cleanName,
        embedding: embedding || null,
        usage_count: 1,
      },
      {
        onConflict: 'user_id,name',
        ignoreDuplicates: false,
      }
    )
    .select()
    .single();

  if (!error && data) {
    return data as Category;
  }

  // Fallback to fetch if conflict occurred without return
  const { data: existing } = await supabaseAdmin
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .ilike('name', cleanName)
    .single();

  if (existing) {
    return existing as Category;
  }

  throw new Error(`Failed to get or create category: ${error?.message}`);
}
