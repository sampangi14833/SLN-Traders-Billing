import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { EmailOtpService } from './email-otp.service';

type ApiResponse<T = void> = {
  success: boolean;
  message: string;
  data: T | null;
  token?: string;
};

type RegisterData = {
  name?: string;
  email?: string;
  password?: string;
};

type LoginData = {
  email?: string;
  password?: string;
};

type ResetPasswordData = {
  email?: string;
  otp?: string;
  newPassword?: string;
};

type OtpPurpose = 'registration' | 'password reset';

type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  verified: boolean;
  createdAt: number;
  updatedAt: number;
  lastLoginAt?: number;
};

type StoredOtp = {
  email: string;
  otp: string;
  purpose: OtpPurpose;
  expiresAt: number;
  verified: boolean;
};

type StoredSession = {
  token: string;
  email: string;
  createdAt: number;
  expiresAt: number;
};

type StoredAuthState = {
  users: StoredUser[];
  otps: StoredOtp[];
  sessions: StoredSession[];
  currentSessionToken: string | null;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'sln-traders-billing.auth.v1';
  private readonly tokenIssuer = 'sln-traders-billing';
  private readonly tokenAudience = 'sln-traders-billing-frontend';
  private readonly tokenSigningKey = 'sln-traders-billing-local-jwt-signature';
  private readonly otpTtlMs = 5 * 60 * 1000;
  private readonly sessionTtlMs = 12 * 60 * 60 * 1000;
  private readonly cleanupIntervalMs = 60 * 1000;

  private users: StoredUser[] = [];
  private otps: StoredOtp[] = [];
  private sessions: StoredSession[] = [];
  private currentSessionToken: string | null = null;

  constructor(private readonly emailOtp: EmailOtpService) {
    this.restoreState();
    this.cleanupExpiredData();

    if (typeof window !== 'undefined') {
      window.setInterval(() => this.cleanupExpiredData(), this.cleanupIntervalMs);
    }
  }

  sendOtp(email: string): Observable<ApiResponse> {
    this.cleanupExpiredData();

    const normalizedEmail = this.normalizeEmail(email);
    const emailError = this.getEmailError(normalizedEmail);

    if (emailError) {
      return this.error(emailError);
    }

    if (this.users.some((storedUser) => storedUser.email === normalizedEmail)) {
      return this.error('User already exists');
    }

    return this.createAndSendOtp(normalizedEmail, 'registration');
  }

  verifyOtp(email: string, otp: string): Observable<ApiResponse> {
    this.cleanupExpiredData();

    const normalizedEmail = this.normalizeEmail(email);
    const normalizedOtp = otp?.trim() ?? '';
    const validationError = this.getEmailError(normalizedEmail) || this.getOtpError(normalizedOtp);

    if (validationError) {
      return this.error(validationError);
    }

    const storedOtp = this.otps.find(
      (entry) =>
        entry.email === normalizedEmail &&
        entry.otp === normalizedOtp &&
        entry.purpose === 'registration'
    );

    if (!storedOtp) {
      return this.error('Invalid OTP');
    }

    storedOtp.verified = true;
    this.persistState();

    return this.ok('OTP verified', null);
  }

  register(user: RegisterData): Observable<ApiResponse> {
    this.cleanupExpiredData();

    const name = user.name?.trim() ?? '';
    const email = this.normalizeEmail(user.email);
    const password = user.password ?? '';
    const validationError =
      this.getNameError(name) || this.getEmailError(email) || this.getPasswordError(password);

    if (validationError) {
      return this.error(validationError);
    }

    if (this.users.some((storedUser) => storedUser.email === email)) {
      return this.error('User already exists');
    }

    if (!this.isOtpVerified(email, 'registration')) {
      return this.error('OTP not verified or expired');
    }

    const now = Date.now();
    this.users.push({
      id: this.createId(),
      name,
      email,
      passwordHash: this.hashPassword(password),
      verified: true,
      createdAt: now,
      updatedAt: now
    });

    this.clearOtp(email);
    this.persistState();

    return this.ok('Registered', null);
  }

  login(data: LoginData): Observable<ApiResponse<string>> {
    this.cleanupExpiredData();

    const email = this.normalizeEmail(data.email);
    const password = data.password ?? '';
    const validationError = this.getEmailError(email) || this.getPasswordError(password);

    if (validationError) {
      return this.error(validationError, 401);
    }

    const user = this.users.find((storedUser) => storedUser.email === email);
    if (!user || !user.verified || user.passwordHash !== this.hashPassword(password)) {
      return this.error('Invalid email or password', 401);
    }

    user.lastLoginAt = Date.now();
    user.updatedAt = user.lastLoginAt;

    const session = this.createSession(user.email);
    return this.ok('Login successful', session.token, { token: session.token });
  }

  saveToken(token: string, email?: string): void {
    this.cleanupExpiredData();

    const normalizedEmail = this.normalizeEmail(email);
    const existingSession = this.sessions.find((session) => session.token === token);

    if (existingSession) {
      this.currentSessionToken = existingSession.token;
      this.persistState();
      return;
    }

    if (normalizedEmail && this.users.some((user) => user.email === normalizedEmail)) {
      const session = this.createSession(normalizedEmail, token);
      this.currentSessionToken = session.token;
      this.persistState();
    }
  }

  getToken(): string | null {
    this.cleanupExpiredData();
    return this.currentSessionToken;
  }

  getCurrentUser(): string | null {
    this.cleanupExpiredData();

    if (!this.currentSessionToken) {
      return null;
    }

    return this.sessions.find((session) => session.token === this.currentSessionToken)?.email ?? null;
  }

  logout(): void {
    if (this.currentSessionToken) {
      this.sessions = this.sessions.filter((session) => session.token !== this.currentSessionToken);
    }

    this.currentSessionToken = null;
    this.persistState();
  }

  isLoggedIn(): boolean {
    this.cleanupExpiredData();
    return this.getCurrentUser() !== null;
  }

  forgotPassword(email: string): Observable<ApiResponse> {
    this.cleanupExpiredData();

    const normalizedEmail = this.normalizeEmail(email);
    const emailError = this.getEmailError(normalizedEmail);

    if (emailError) {
      return this.error(emailError);
    }

    if (!this.users.some((storedUser) => storedUser.email === normalizedEmail)) {
      return this.error('Email not registered');
    }

    return this.createAndSendOtp(normalizedEmail, 'password reset');
  }

  resetPassword(data: ResetPasswordData): Observable<ApiResponse> {
    this.cleanupExpiredData();

    const email = this.normalizeEmail(data.email);
    const otp = data.otp?.trim() ?? '';
    const newPassword = data.newPassword ?? '';
    const validationError =
      this.getEmailError(email) || this.getOtpError(otp) || this.getPasswordError(newPassword, true);

    if (validationError) {
      return this.error(validationError);
    }

    const user = this.users.find((storedUser) => storedUser.email === email);
    if (!user) {
      return this.error('User not found');
    }

    if (!this.consumeOtp(email, otp, 'password reset')) {
      return this.error('Invalid OTP');
    }

    const now = Date.now();
    user.passwordHash = this.hashPassword(newPassword);
    user.updatedAt = now;

    this.persistState();

    return this.ok('Password updated', null);
  }

  private createAndSendOtp(email: string, purpose: OtpPurpose): Observable<ApiResponse> {
    const otp = this.generateOtp();

    if (!this.emailOtp.isConfigured()) {
      return this.error(
        'Email OTP is not configured. Add EmailJS serviceId, templateId, and publicKey to send OTP by email.',
        503
      );
    }

    return this.emailOtp.sendOtp(email, otp, purpose).pipe(
      map((): ApiResponse => {
        this.storeOtp(email, otp, purpose);

        return {
          success: true,
          message: 'OTP sent to email',
          data: null
        };
      }),
      catchError(() =>
        this.error<void>(
          'Unable to send OTP email. Check the EmailJS service, template, and public key.',
          503
        )
      )
    );
  }

  private storeOtp(email: string, otp: string, purpose: OtpPurpose): void {
    this.otps = this.otps.filter(
      (storedOtp) => storedOtp.email !== email || storedOtp.purpose !== purpose
    );
    this.otps.push({
      email,
      otp,
      purpose,
      expiresAt: Date.now() + this.otpTtlMs,
      verified: false
    });
    this.persistState();
  }

  private ok<T>(
    message: string,
    data: T | null,
    extras?: Partial<ApiResponse<T>>
  ): Observable<ApiResponse<T>> {
    return of({
      success: true,
      message,
      data,
      ...extras
    });
  }

  private error<T>(message: string, status = 400): Observable<ApiResponse<T>> {
    return throwError(() => ({
      status,
      error: {
        success: false,
        message,
        data: null
      } satisfies ApiResponse<T>
    }));
  }

  private createSession(email: string, token?: string): StoredSession {
    const now = Date.now();
    const expiresAt = now + this.sessionTtlMs;
    const session = {
      token: token && this.isTokenForEmail(token, email) ? token : this.createJwtToken(email, now, expiresAt),
      email,
      createdAt: now,
      expiresAt
    };

    this.sessions = this.sessions.filter((storedSession) => storedSession.email !== email);
    this.sessions.push(session);
    this.currentSessionToken = session.token;
    this.persistState();

    return session;
  }

  private cleanupExpiredData(): void {
    const now = Date.now();
    const otpCount = this.otps.length;
    const sessionCount = this.sessions.length;
    const previousCurrentSessionToken = this.currentSessionToken;

    this.otps = this.otps.filter((otp) => otp.expiresAt > now);
    this.sessions = this.sessions.filter(
      (session) =>
        session.expiresAt > now &&
        this.users.some((storedUser) => storedUser.email === session.email) &&
        this.isValidSessionToken(session)
    );

    if (
      this.currentSessionToken &&
      !this.sessions.some((session) => session.token === this.currentSessionToken)
    ) {
      this.currentSessionToken = null;
    }

    if (
      otpCount !== this.otps.length ||
      sessionCount !== this.sessions.length ||
      previousCurrentSessionToken !== this.currentSessionToken
    ) {
      this.persistState();
    }
  }

  private isOtpVerified(email: string, purpose: OtpPurpose): boolean {
    return this.otps.some((otp) => otp.email === email && otp.purpose === purpose && otp.verified);
  }

  private consumeOtp(email: string, otp: string, purpose: OtpPurpose): boolean {
    const matchingOtp = this.otps.find(
      (entry) => entry.email === email && entry.otp === otp && entry.purpose === purpose
    );

    if (!matchingOtp) {
      return false;
    }

    this.otps = this.otps.filter((entry) => entry !== matchingOtp);
    this.persistState();
    return true;
  }

  private clearOtp(email: string): void {
    this.otps = this.otps.filter((otp) => otp.email !== email);
    this.persistState();
  }

  private restoreState(): void {
    const storage = this.getStorage();

    if (!storage) {
      return;
    }

    try {
      const rawState = storage.getItem(this.storageKey);

      if (!rawState) {
        return;
      }

      const state = JSON.parse(rawState) as Partial<StoredAuthState>;

      this.users = Array.isArray(state.users) ? state.users.filter(this.isStoredUser) : [];
      this.otps = Array.isArray(state.otps) ? state.otps.filter(this.isStoredOtp) : [];
      this.sessions = Array.isArray(state.sessions)
        ? state.sessions.filter(this.isStoredSession)
        : [];
      this.currentSessionToken =
        typeof state.currentSessionToken === 'string' ? state.currentSessionToken : null;
    } catch {
      this.users = [];
      this.otps = [];
      this.sessions = [];
      this.currentSessionToken = null;
    }
  }

  private persistState(): void {
    const storage = this.getStorage();

    if (!storage) {
      return;
    }

    try {
      const state: StoredAuthState = {
        users: this.users,
        otps: this.otps,
        sessions: this.sessions,
        currentSessionToken: this.currentSessionToken
      };

      storage.setItem(this.storageKey, JSON.stringify(state));
    } catch {
      // Local storage can be disabled or full; the app still works for the current tab session.
    }
  }

  private getStorage(): Storage | null {
    try {
      return typeof window !== 'undefined' ? window.localStorage : null;
    } catch {
      return null;
    }
  }

  private isStoredUser(value: unknown): value is StoredUser {
    const user = value as Partial<StoredUser>;

    return Boolean(
      user &&
        typeof user.id === 'string' &&
        typeof user.name === 'string' &&
        typeof user.email === 'string' &&
        typeof user.passwordHash === 'string' &&
        typeof user.verified === 'boolean' &&
        typeof user.createdAt === 'number' &&
        typeof user.updatedAt === 'number'
    );
  }

  private isStoredOtp(value: unknown): value is StoredOtp {
    const otp = value as Partial<StoredOtp>;

    return Boolean(
      otp &&
        typeof otp.email === 'string' &&
        typeof otp.otp === 'string' &&
        (otp.purpose === 'registration' || otp.purpose === 'password reset') &&
        typeof otp.expiresAt === 'number' &&
        typeof otp.verified === 'boolean'
    );
  }

  private isStoredSession(value: unknown): value is StoredSession {
    const session = value as Partial<StoredSession>;

    return Boolean(
      session &&
        typeof session.token === 'string' &&
        typeof session.email === 'string' &&
        typeof session.createdAt === 'number' &&
        typeof session.expiresAt === 'number'
    );
  }

  private createJwtToken(email: string, issuedAt: number, expiresAt: number): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    const payload = {
      sub: email,
      email,
      iss: this.tokenIssuer,
      aud: this.tokenAudience,
      iat: Math.floor(issuedAt / 1000),
      exp: Math.floor(expiresAt / 1000),
      jti: this.createId()
    };
    const tokenBody = `${this.base64UrlEncode(JSON.stringify(header))}.${this.base64UrlEncode(
      JSON.stringify(payload)
    )}`;

    return `${tokenBody}.${this.createTokenSignature(tokenBody)}`;
  }

  private isValidSessionToken(session: StoredSession): boolean {
    const payload = this.parseJwtPayload(session.token);

    if (!payload) {
      return false;
    }

    return (
      payload.email === session.email &&
      payload.sub === session.email &&
      payload.iss === this.tokenIssuer &&
      payload.aud === this.tokenAudience &&
      payload.exp * 1000 > Date.now() &&
      this.hasValidTokenSignature(session.token)
    );
  }

  private isTokenForEmail(token: string, email: string): boolean {
    const payload = this.parseJwtPayload(token);

    return Boolean(payload && payload.email === email && this.hasValidTokenSignature(token));
  }

  private parseJwtPayload(token: string):
    | {
        sub: string;
        email: string;
        iss: string;
        aud: string;
        iat: number;
        exp: number;
        jti: string;
      }
    | null {
    const parts = token.split('.');

    if (parts.length !== 3 || !this.hasValidTokenSignature(token)) {
      return null;
    }

    try {
      const payload = JSON.parse(this.base64UrlDecode(parts[1])) as {
        sub?: unknown;
        email?: unknown;
        iss?: unknown;
        aud?: unknown;
        iat?: unknown;
        exp?: unknown;
        jti?: unknown;
      };

      if (
        typeof payload.sub !== 'string' ||
        typeof payload.email !== 'string' ||
        typeof payload.iss !== 'string' ||
        typeof payload.aud !== 'string' ||
        typeof payload.iat !== 'number' ||
        typeof payload.exp !== 'number' ||
        typeof payload.jti !== 'string'
      ) {
        return null;
      }

      return {
        sub: payload.sub,
        email: payload.email,
        iss: payload.iss,
        aud: payload.aud,
        iat: payload.iat,
        exp: payload.exp,
        jti: payload.jti
      };
    } catch {
      return null;
    }
  }

  private hasValidTokenSignature(token: string): boolean {
    const [header, payload, signature] = token.split('.');

    if (!header || !payload || !signature) {
      return false;
    }

    return signature === this.createTokenSignature(`${header}.${payload}`);
  }

  private createTokenSignature(tokenBody: string): string {
    return this.base64UrlEncode(this.hashPassword(`${tokenBody}.${this.tokenSigningKey}`));
  }

  private base64UrlEncode(value: string): string {
    return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  private base64UrlDecode(value: string): string {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

    return atob(paddedBase64);
  }

  private normalizeEmail(email?: string | null): string {
    return email?.trim().toLowerCase() ?? '';
  }

  private getNameError(name: string): string | null {
    if (!name) {
      return 'Name is required';
    }

    return name.length > 100 ? 'Name must be at most 100 characters' : null;
  }

  private getEmailError(email: string): string | null {
    if (!email) {
      return 'Email is required';
    }

    if (email.length > 254) {
      return 'Email must be at most 254 characters';
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? null : 'Email must be valid';
  }

  private getOtpError(otp: string): string | null {
    if (!otp) {
      return 'OTP is required';
    }

    return this.isSixDigitOtp(otp) ? null : 'OTP must be exactly 6 digits';
  }

  private getPasswordError(password: string, isReset = false): string | null {
    if (!password) {
      return isReset ? 'New password is required' : 'Password is required';
    }

    if (password.length < 8 || password.length > 72) {
      return isReset
        ? 'New password must be between 8 and 72 characters'
        : 'Password must be between 8 and 72 characters';
    }

    return null;
  }

  private isSixDigitOtp(otp: string): boolean {
    return /^\d{6}$/.test(otp);
  }

  private generateOtp(): string {
    return `${Math.floor(100000 + Math.random() * 900000)}`;
  }

  private createId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private hashPassword(password: string): string {
    let hash = 2166136261;

    for (let index = 0; index < password.length; index += 1) {
      hash ^= password.charCodeAt(index);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }

    return (hash >>> 0).toString(16);
  }
}
