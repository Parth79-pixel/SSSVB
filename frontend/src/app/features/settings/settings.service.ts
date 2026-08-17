import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ShopSettings, ShopSettingsUpdate } from '../../core/models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  baseUrl = environment.apiUrl + '/settings';

  constructor(private http: HttpClient) {}

  get(): Observable<ShopSettings> {
    return this.http.get<ShopSettings>(this.baseUrl);
  }

  update(payload: ShopSettingsUpdate): Observable<ShopSettings> {
    return this.http.put<ShopSettings>(this.baseUrl, payload);
  }
}