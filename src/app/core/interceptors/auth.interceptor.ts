import { HttpInterceptorFn } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import {AuthService} from "../services/auth-service";
import {JwtService} from "../services/jwt.service";

// src/app/core/interceptors/auth.interceptor.ts
export const AuthInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const jwtService = inject(JwtService);
  const token = jwtService.getToken();

  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Dans votre intercepteur
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('HTTP Error in interceptor:', error);

      // Only log out for genuine authentication failures, not for API errors
      if (error.status === 401) {
        console.log('Unauthorized error detected');

        // Check if this is a request to the absence/module/classe/etudiants endpoint
        // If it is, don't log out
        if (error.url && error.url.includes('/absences/module/') && error.url.includes('/etudiants')) {
          console.log('Error with absences/module endpoint - not logging out');
          // Just return the error without logging out
        } else {
          console.log('Unauthorized for a protected route, redirecting to login...');
          authService.logout();
        }
      }
      return throwError(() => error);
    })
  );
};
