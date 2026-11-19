import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, of, switchMap, throwError } from 'rxjs';
import { AuthSessionService } from '../services/auth-session.service';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const api = environment.apiDomain.replace(/\/$/, '');
  const path = request.url.split('?')[0];
  const publicEndpoints = ['login', 'clients', 'sellers', 'renew'];
  if (
    !path.startsWith(`${api}/`) ||
    publicEndpoints.some((endpoint) => path === `${api}/users/${endpoint}`)
  )
    return next(request);

  const session = inject(AuthSessionService);
  const currentToken = session.accessToken();
  if (!currentToken) return next(request);
  const refreshing = session.expiresSoon();
  const token = refreshing ? session.renew() : of(currentToken);
  const authorized = (accessToken: string) =>
    request.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } });

  return token.pipe(
    switchMap((accessToken) =>
      next(authorized(accessToken)).pipe(
        catchError((error: unknown) => {
          // 403 means missing permissions; refreshing cannot grant them.
          if (!(error instanceof HttpErrorResponse) || error.status !== 401)
            return throwError(() => error);
          if (refreshing) {
            if (session.accessToken() === accessToken) session.clear();
            return throwError(() => error);
          }
          const latest = session.accessToken();
          if (!latest) return throwError(() => error);
          const retryToken = latest !== accessToken ? of(latest) : session.renew();
          return retryToken.pipe(
            switchMap((renewed) =>
              next(authorized(renewed)).pipe(
                catchError((retryError: unknown) => {
                  if (
                    retryError instanceof HttpErrorResponse &&
                    retryError.status === 401 &&
                    session.accessToken() === renewed
                  )
                    session.clear();
                  return throwError(() => retryError);
                }),
              ),
            ),
          );
        }),
      ),
    ),
  );
};
