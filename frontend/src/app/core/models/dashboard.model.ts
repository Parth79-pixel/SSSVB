export interface DashboardStats {
  total_revenue: number;
  pending_amount: number;
  total_invoices: number;
  low_stock_count: number;
}

export interface RecentInvoice {
  id: number;
  customer_name: string;
  final_amount: number;
  balance_due: number;
  status: string;
  created_at?: string | null;
}

export interface MonthlySalesPoint {
  month: string;
  total: number;
}

export interface ReportsSummary {
  total_revenue: number;
  total_invoices: number;
  total_paid: number;
  pending_amount: number;
  this_month_revenue: number;
  growth_percent: number;
}

export interface DailyRevenuePoint {
  label: string;
  total: number;
}

export interface TopProduct {
  product_name: string;
  total_qty: number;
}

export interface ShopSettings {
  id: number;
  shop_name: string;
  address?: string | null;
  phone?: string | null;
  invoice_prefix: string;
  tax_percent: number;
}

export interface ShopSettingsUpdate {
  shop_name: string;
  address?: string;
  phone?: string;
  invoice_prefix: string;
  tax_percent: number;
}