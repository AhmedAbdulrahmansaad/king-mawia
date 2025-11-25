export type UserRole = 'admin' | 'seller' | 'supervisor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  branch?: string;
  active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  active: boolean;
  created_at: string;
}

export interface Sale {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
  seller_id: string;
  seller_name: string;
  sale_date: string;
  payment_status: 'paid' | 'debt';
  customer_name?: string;
  created_at: string;
}

export interface Debt {
  id: string;
  customer_name: string;
  amount: number;
  product_name: string;
  sale_date: string;
  status: 'pending' | 'paid' | 'partial';
  paid_amount: number;
  remaining_amount: number;
  seller_id: string;
  notes?: string;
  created_at: string;
}

export interface AIAnalysisResult {
  sales: {
    product_name: string;
    quantity: number;
    total_amount: number;
  }[];
  debts: {
    customer_name: string;
    amount: string;
    product_name: string;
    date: string;
  }[];
  summary: {
    total_sales: number;
    total_debts: number;
    net_amount: number;
  };
}
