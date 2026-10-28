import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { appSettings } from '../config';
import { AuthService } from './auth.service';

// Adds "Authorization: Bearer <token>" to every API call.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(appSettings.apiUrl)) {
    return next(req);
  }
  return from(inject(AuthService).token()).pipe(
    switchMap((token) => next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))),
  );
};
