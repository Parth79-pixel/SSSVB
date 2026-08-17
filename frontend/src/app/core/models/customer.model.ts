export interface Customer {
  id: number;
  customer_name: string;
  mobile: string;
  email?: string | null;
  created_at?: string | null;
}

export interface CustomerCreate {
  customer_name: string;
  mobile: string;
  email?: string;
}

export interface CustomerUpdate {
  customer_name: string;
  mobile: string;
  email?: string;
}

export interface CustomerStats {
  total_customers: number;
  top_spender_name?: string | null;
  top_spender_amount?: number | null;
}