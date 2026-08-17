import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, TokenResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  login(payload: LoginRequest): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>(environment.apiUrl + '/auth/login', payload)
      .pipe(tap((res) => this.storeTokens(res)));
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    this.router.navigate(['/login']);
  }

  refreshAccessToken(): Observable<TokenResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<TokenResponse>(environment.apiUrl + '/auth/refresh', { refresh_token: refreshToken })
      .pipe(tap((res) => this.storeTokens(res)));
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  getAccessToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }
    return localStorage.getItem('refresh_token');
  }

  storeTokens(res: TokenResponse) {
    if (!this.isBrowser) {
      return;
    }
    localStorage.setItem('access_token', res.access_token);
    if (res.refresh_token) {
      localStorage.setItem('refresh_token', res.refresh_token);
    }
  }
}