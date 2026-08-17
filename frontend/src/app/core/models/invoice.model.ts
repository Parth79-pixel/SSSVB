export interface InvoiceItemIn {
  product_id: number;
  qty: number;
  price: number;
}

export interface InvoiceCreate {
  customer_id: number;
  status: string;
  discount: number;
  amount_paid: number;
  balance_due: number;
  items: InvoiceItemIn[];
}

export interface InvoiceUpdate {
  customer_name: string;
  customer_mobile: string;
  status: string;
  amount_paid: number;
  balance_due: number;
}

export interface InvoiceItemRead {
  id: number;
  product_id: number;
  product_name: string;
  price_per_unit: number;
  quantity: number;
  item_total: number;
}

export interface InvoiceRead {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_mobile: string;
  subtotal: number;
  discount: number;
  final_amount: number;
  amount_paid: number;
  balance_due: number;
  status: string;
  created_at?: string | null;
  items: InvoiceItemRead[];
}

export interface InvoiceSummary {
  customer_name: string;
  customer_mobile: string;
  status: string;
  final_amount: number;
  amount_paid: number;
  balance_due: number;
}

export interface InvoiceListItem {
  id: number;
  customer_name: string;
  customer_mobile: string;
  final_amount: number;
  amount_paid: number;
  balance_due: number;
  status: string;
  created_at?: string | null;
}

export interface InvoiceCreateResponse {
  success: boolean;
  invoice_id?: number | null;
  message?: string | null;
}