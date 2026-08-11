export interface Transaction {
  id: string;
  short_id?: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  merchant?: string;
  description?: string;
  category_id?: string;
  source?: string;
  occurred_at: string;
  created_at?: string;
  deleted_at?: string | null;
}

export interface Activity {
  id: string;
  short_id?: string;
  user_id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  occurred_at: string;
  created_at?: string;
  deleted_at?: string | null;
}

export interface Category {
  id: string;
  name: string;
  type?: 'expense' | 'income';
  icon?: string;
}

export interface InsightItem {
  id: number;
  type: 'text' | 'chart' | 'stat';
  title: string;
  category: 'reflection' | 'current' | 'projection';
  data?: any;
  chartData?: { name: string; value: number; fill?: string }[];
  insight: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  undoAction?: () => void;
}

export interface RecordFilter {
  query: string;
  category: string;
  dateRange: 'all' | 'today' | '7days' | 'this_month' | 'last_month' | 'custom';
  startDate?: string;
  endDate?: string;
}

export type SortField = 'occurred_at' | 'amount' | 'merchant' | 'title' | 'priority' | 'status';
export type SortDirection = 'asc' | 'desc';
