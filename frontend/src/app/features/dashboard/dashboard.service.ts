import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardStats, RecentInvoice, MonthlySalesPoint } from '../../core/models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  baseUrl = environment.apiUrl + '/dashboard';

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(this.baseUrl + '/stats');
  }

  getRecentInvoices(): Observable<RecentInvoice[]> {
    return this.http.get<RecentInvoice[]>(this.baseUrl + '/recent-invoices');
  }

  getMonthlySales(): Observable<MonthlySalesPoint[]> {
    return this.http.get<MonthlySalesPoint[]>(this.baseUrl + '/monthly-sales');
  }
}