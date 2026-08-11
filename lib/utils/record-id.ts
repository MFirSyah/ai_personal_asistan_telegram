/**
 * Utility functions for generating and matching human-friendly short IDs for transactions and activities.
 */

export function getShortId(id: string, type: 'transaction' | 'activity'): string {
  if (!id) return type === 'transaction' ? 'TX-0000' : 'ACT-0000';

  // Extract first 6 hex chars of UUID for clean short ID
  const cleanId = id.replace(/-/g, '');
  const prefix = type === 'transaction' ? 'TX' : 'ACT';
  const shortHash = cleanId.substring(0, 6).toUpperCase();

  return `${prefix}-${shortHash}`;
}

export function attachShortId<T extends { id: string }>(item: T, type: 'transaction' | 'activity'): T & { short_id: string } {
  return {
    ...item,
    short_id: getShortId(item.id, type),
  };
}

export function matchesRecordId(item: { id: string; short_id?: string }, query: string): boolean {
  if (!query) return false;
  const q = query.trim().toUpperCase();
  const fullId = item.id.toUpperCase();
  const shortId = (item.short_id || getShortId(item.id, query.startsWith('TX') ? 'transaction' : 'activity')).toUpperCase();

  return fullId.includes(q) || shortId.includes(q) || shortId.replace('-', '').includes(q.replace('-', ''));
}
