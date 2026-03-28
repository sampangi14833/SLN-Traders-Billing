import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'token';
  private readonly currentUserKey = 'sln-billing-current-user';

  private baseUrl = `${environment.apiUrl}/api/auth`;

  constructor(private http: HttpClient) {}

  sendOtp(email: string) {
    return this.http.post(`${this.baseUrl}/send-otp?email=${email}`, {});
  }

  verifyOtp(email: string, otp: string) {
    return this.http.post(`${this.baseUrl}/verify-otp`, { email, otp });
  }

  register(user: any) {
    return this.http.post(`${this.baseUrl}/register`, user);
  }

  login(data: any) {
    return this.http.post<any>(`${this.baseUrl}/login`, data);
  }

  saveToken(token: string, email?: string) {
    localStorage.setItem(this.tokenKey, token);

    const normalizedEmail = this.normalizeEmail(email);
    if (normalizedEmail) {
      localStorage.setItem(this.currentUserKey, normalizedEmail);
      return;
    }

    const tokenIdentity = this.extractIdentityFromToken(token);
    if (tokenIdentity) {
      localStorage.setItem(this.currentUserKey, tokenIdentity);
    }
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): string | null {
    const storedUser = localStorage.getItem(this.currentUserKey);
    if (storedUser) {
      return storedUser;
    }

    const token = this.getToken();
    if (!token) {
      return null;
    }

    const tokenIdentity = this.extractIdentityFromToken(token);
    if (tokenIdentity) {
      localStorage.setItem(this.currentUserKey, tokenIdentity);
    }

    return tokenIdentity;
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.currentUserKey);
  }

  isLoggedIn() {
    return !!this.getToken();
  }

  forgotPassword(email: string) {
    return this.http.post(`${this.baseUrl}/forgot-password?email=${email}`, {});
  }

  resetPassword(data: any) {
    return this.http.post(`${this.baseUrl}/reset-password`, data);
  }

  private normalizeEmail(email?: string): string | null {
    const normalizedEmail = email?.trim().toLowerCase();
    return normalizedEmail ? normalizedEmail : null;
  }

  private extractIdentityFromToken(token: string): string | null {
    const payload = this.decodeJwtPayload(token);
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const identity =
      this.getStringField(payload, 'email')
      || this.getStringField(payload, 'preferred_username')
      || this.getStringField(payload, 'username')
      || this.getStringField(payload, 'sub');

    return identity ? identity.trim().toLowerCase() : null;
  }

  private getStringField(payload: Record<string, unknown>, key: string): string | null {
    const value = payload[key];
    return typeof value === 'string' && value.trim() ? value : null;
  }

  private decodeJwtPayload(token: string): Record<string, unknown> | null {
    const tokenParts = token.split('.');
    if (tokenParts.length < 2) {
      return null;
    }

    try {
      const normalizedPayload = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
      const paddedPayload = normalizedPayload.padEnd(
        normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
        '='
      );

      return JSON.parse(atob(paddedPayload)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}
