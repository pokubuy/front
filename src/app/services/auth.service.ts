import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, timeout } from 'rxjs';
import { AuthData } from '../models/auth/auth-data.model';
import { LoginRequest } from '../models/auth/login-request.model';
import { RegisterRequest, RegistrationKind } from '../models/auth/register-request.model';
import { AuthSessionService } from './auth-session.service';
import { environment } from '../../environments/environment';

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(AuthSessionService);

  login(request: LoginRequest): Observable<AuthData> {
    return this.authenticate('login', request);
  }

  register(request: RegisterRequest, kind: RegistrationKind): Observable<AuthData> {
    return this.authenticate(kind === 'seller' ? 'sellers' : 'clients', request);
  }

  private authenticate(
    endpoint: string,
    request: LoginRequest | RegisterRequest,
  ): Observable<AuthData> {
    return this.http
      .post<AuthData>(`${environment.apiDomain}/users/${endpoint}`, request, {
        transferCache: false,
      })
      .pipe(
        timeout(15_000),
        tap((data) => this.session.accept(data)),
      );
  }
}
