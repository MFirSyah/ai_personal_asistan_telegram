export interface TransactionInput {
  amount: number;
  type: 'expense' | 'income';
  merchant?: string;
  description?: string;
  category_id?: string | null;
  occurred_at?: string;
}

export interface ActivityInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  occurred_at?: string;
}

export function validateTransactionInput(input: any): { valid: boolean; error?: string; data?: TransactionInput } {
  if (!input || typeof input !== 'object') {
    return { valid: false, error: 'Data transaksi tidak valid' };
  }

  const parsedAmount = Number(input.amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 100_000_000_000) {
    return { valid: false, error: 'Nominal transaksi harus berupa angka positif hingga 100 miliar' };
  }

  const type = input.type === 'income' ? 'income' : 'expense';
  const merchant = String(input.merchant || 'Manual Dashboard').trim();
  const description = String(input.description || '').trim();

  return {
    valid: true,
    data: {
      amount: parsedAmount,
      type,
      merchant,
      description,
      category_id: input.category_id || null,
      occurred_at: input.occurred_at || new Date().toISOString(),
    },
  };
}

export function validateActivityInput(input: any): { valid: boolean; error?: string; data?: ActivityInput } {
  if (!input || typeof input !== 'object') {
    return { valid: false, error: 'Data aktivitas tidak valid' };
  }

  const title = String(input.title || '').trim();
  if (!title) {
    return { valid: false, error: 'Judul aktivitas tidak boleh kosong' };
  }

  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];

  const priority = validPriorities.includes(input.priority) ? input.priority : 'medium';
  const status = validStatuses.includes(input.status) ? input.status : 'scheduled';
  const description = String(input.description || '').trim();

  return {
    valid: true,
    data: {
      title,
      description,
      priority,
      status,
      occurred_at: input.occurred_at || new Date().toISOString(),
    },
  };
}
