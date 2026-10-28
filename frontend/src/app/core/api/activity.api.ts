import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { appSettings } from '../config';
import { Activity, Health } from '../models';

@Injectable({ providedIn: 'root' })
export class ActivityApi {
  private readonly http = inject(HttpClient);

  latest(limit = 15): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${appSettings.apiUrl}/activity`, {
      params: { limit },
    });
  }

  health(): Observable<Health> {
    return this.http.get<Health>(`${appSettings.apiUrl}/health`);
  }
}
