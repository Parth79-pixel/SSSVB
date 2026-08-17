import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  InvoiceCreate,
  InvoiceCreateResponse,
  InvoiceRead,
  InvoiceUpdate,
  InvoiceSummary,
  InvoiceListItem,
} from '../../core/models/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  baseUrl = environment.apiUrl + '/invoices';

  constructor(private http: HttpClient) {}

  create(payload: InvoiceCreate): Observable<InvoiceCreateResponse> {
    return this.http.post<InvoiceCreateResponse>(this.baseUrl, payload);
  }

  list(from?: string, to?: string): Observable<InvoiceListItem[]> {
    let url = this.baseUrl;
    if (from && to) {
      url = url + '?from=' + from + '&to=' + to;
    }
    return this.http.get<InvoiceListItem[]>(url);
  }

  getSummary(id: number): Observable<InvoiceSummary> {
    return this.http.get<InvoiceSummary>(this.baseUrl + '/' + id + '/summary');
  }

  getFull(id: number): Observable<InvoiceRead> {
    return this.http.get<InvoiceRead>(this.baseUrl + '/' + id);
  }

  update(id: number, payload: InvoiceUpdate): Observable<InvoiceRead> {
    return this.http.put<InvoiceRead>(this.baseUrl + '/' + id, payload);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(this.baseUrl + '/' + id);
  }

  exportCsvUrl(from?: string, to?: string): string {
    let url = this.baseUrl + '/export';
    if (from && to) {
      url = url + '?from=' + from + '&to=' + to;
    }
    return url;
  }
}