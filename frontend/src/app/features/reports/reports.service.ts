import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReportsSummary, DailyRevenuePoint, TopProduct } from '../../core/models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  baseUrl = environment.apiUrl + '/reports';

  constructor(private http: HttpClient) {}

  getSummary(): Observable<ReportsSummary> {
    return this.http.get<ReportsSummary>(this.baseUrl + '/summary');
  }

  getWeeklyRevenue(): Observable<DailyRevenuePoint[]> {
    return this.http.get<DailyRevenuePoint[]>(this.baseUrl + '/weekly-revenue');
  }

  getTopProducts(): Observable<TopProduct[]> {
    return this.http.get<TopProduct[]>(this.baseUrl + '/top-products');
  }
}