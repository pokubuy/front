import { afterNextRender, computed, inject, Service, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpBackend, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, map, Observable, shareReplay, throwError, timeout } from 'rxjs';
import { AuthData } from '../models/auth/auth-data.model';
import { TokenClaims } from '../models/auth/token-claims.model';
import { RenewTokenRequest, RenewTokenResponse } from '../models/auth/renew-token.model';
import { environment } from '../../environments/environment';

@Service()
export class AuthSessionService {
  private readonly document = inject(DOCUMENT);
  // Refresh bypasses the authentication interceptor to prevent recursion.
  private readonly http = new HttpClient(inject(HttpBackend));
  private readonly storageKey = 'pokubuy.auth';
  private readonly tokens = signal<AuthData | null>(null);
  private renewal: Observable<string> | null = null;
  readonly accessToken = computed(() => this.tokens()?.accessToken ?? null);
  readonly authenticated = computed(() => this.tokens() !== null);
  readonly displayName = computed(() => {
    const claims = this.readClaims(this.accessToken() ?? '');
    return claims?.preferred_username || claims?.email || 'Мой аккаунт';
  });

  constructor() {
    // Browser storage is read after hydration, never while rendering SSR HTML.
    afterNextRender(() => {
      try {
        const saved = this.document.defaultView?.sessionStorage.getItem(this.storageKey);
        if (saved) {
          const data: unknown = JSON.parse(saved);
          if (!this.isAuthData(data)) {
            this.clear();
            return;
          }
          this.accept(data);
          if (this.expiresSoon()) this.renew().subscribe({ error: () => undefined });
        }
      } catch {
        this.clear();
      }
    });
  }

  accept(data: AuthData): void {
    if (!this.isAuthData(data)) throw new Error('Invalid authentication response');
    this.tokens.set(data);
    try {
      this.document.defaultView?.sessionStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch {
      // Storage may be disabled: the current in-memory session still works.
    }
  }

  clear(): void {
    this.tokens.set(null);
    this.renewal = null;
    try {
      this.document.defaultView?.sessionStorage.removeItem(this.storageKey);
    } catch {
      /* Storage disabled. */
    }
  }

  expiresSoon(): boolean {
    const claims = this.readClaims(this.accessToken() ?? '');
    return !claims || claims.exp * 1000 <= Date.now() + 30_000;
  }

  renew(): Observable<string> {
    if (this.renewal) return this.renewal;
    const session = this.tokens();
    if (!session) return throwError(() => new Error('No active session'));
    const body: RenewTokenRequest = { refreshToken: session.refreshToken };
    const request: Observable<string> = this.http
      .post<RenewTokenResponse>(`${environment.apiDomain}/users/renew`, body, {
        transferCache: false,
      })
      .pipe(
        timeout(15_000),
        map((response) => {
          // A completed refresh must not restore a session after logout or another login.
          if (this.tokens() !== session) throw new Error('Session changed');
          this.accept({ ...session, accessToken: response.accessToken });
          return response.accessToken;
        }),
        catchError((error: unknown) => {
          if (
            this.tokens() === session &&
            error instanceof HttpErrorResponse &&
            [400, 401, 403].includes(error.status)
          )
            this.clear();
          return throwError(() => error);
        }),
        finalize(() => {
          if (this.renewal === request) this.renewal = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    this.renewal = request;
    return request;
  }

  private isAuthData(value: unknown): value is AuthData {
    return (
      typeof value === 'object' &&
      value !== null &&
      'accessToken' in value &&
      typeof value.accessToken === 'string' &&
      'refreshToken' in value &&
      typeof value.refreshToken === 'string' &&
      value.refreshToken.length > 0 &&
      this.readClaims(value.accessToken) !== null
    );
  }

  private readClaims(token: string): TokenClaims | null {
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const bytes = Uint8Array.from(atob(payload), (character) => character.charCodeAt(0));
      const value: unknown = JSON.parse(new TextDecoder().decode(bytes));
      if (
        typeof value !== 'object' ||
        value === null ||
        !('exp' in value) ||
        typeof value.exp !== 'number' ||
        !Number.isFinite(value.exp)
      )
        return null;
      return {
        exp: value.exp,
        preferred_username:
          'preferred_username' in value && typeof value.preferred_username === 'string'
            ? value.preferred_username
            : undefined,
        email: 'email' in value && typeof value.email === 'string' ? value.email : undefined,
      };
    } catch {
      return null;
    }
  }
}
