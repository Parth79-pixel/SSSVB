export interface Product {
  id: number;
  product_name: string;
  category: string;
  image?: string | null;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
}

export interface ProductUpdate {
  product_name: string;
  price: number;
  stock: number;
  status: string;
}

export interface ProductStats {
  total_products: number;
  total_stock: number;
  low_stock: number;
}

export interface PaginatedProducts {
  items: Product[];
  page: number;
  limit: number;
  total_products: number;
  total_pages: number;
}

export interface Category {
  id: number;
  category_name: string;
}