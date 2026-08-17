import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Product,
  ProductUpdate,
  ProductStats,
  PaginatedProducts,
  Category,
} from '../../core/models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  baseUrl = environment.apiUrl + '/products';

  constructor(private http: HttpClient) {}

  getStats(): Observable<ProductStats> {
    return this.http.get<ProductStats>(this.baseUrl + '/stats');
  }

  list(page: number, limit: number = 10): Observable<PaginatedProducts> {
    return this.http.get<PaginatedProducts>(this.baseUrl + '?page=' + page + '&limit=' + limit);
  }

  search(keyword: string): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl + '/search?keyword=' + keyword);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(this.baseUrl + '/' + id);
  }

  create(formData: FormData): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, formData);
  }

  update(id: number, payload: ProductUpdate): Observable<Product> {
    return this.http.put<Product>(this.baseUrl + '/' + id, payload);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(this.baseUrl + '/' + id);
  }
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  baseUrl = environment.apiUrl + '/categories';

  constructor(private http: HttpClient) {}

  list(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl);
  }

  create(categoryName: string): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, { category_name: categoryName });
  }
}