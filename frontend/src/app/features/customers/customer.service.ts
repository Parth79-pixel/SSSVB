import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Customer,
  CustomerCreate,
  CustomerUpdate,
  CustomerStats,
} from '../../core/models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  baseUrl = environment.apiUrl + '/customers';

  constructor(private http: HttpClient) {}

  getStats(): Observable<CustomerStats> {
    return this.http.get<CustomerStats>(this.baseUrl + '/stats');
  }

  list(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.baseUrl);
  }

  getById(id: number): Observable<Customer> {
    return this.http.get<Customer>(this.baseUrl + '/' + id);
  }

  create(payload: CustomerCreate): Observable<Customer> {
    return this.http.post<Customer>(this.baseUrl, payload);
  }

  update(id: number, payload: CustomerUpdate): Observable<Customer> {
    return this.http.put<Customer>(this.baseUrl + '/' + id, payload);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(this.baseUrl + '/' + id);
  }
}