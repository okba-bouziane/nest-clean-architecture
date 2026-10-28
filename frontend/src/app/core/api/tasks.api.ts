import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { appSettings } from '../config';
import { Task } from '../models';

@Injectable({ providedIn: 'root' })
export class TasksApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${appSettings.apiUrl}/tasks`;

  list(): Observable<Task[]> {
    return this.http.get<Task[]>(this.url);
  }

  create(title: string): Observable<Task> {
    return this.http.post<Task>(this.url, { title });
  }

  complete(id: string): Observable<Task> {
    return this.http.patch<Task>(`${this.url}/${id}/complete`, {});
  }

  reopen(id: string): Observable<Task> {
    return this.http.patch<Task>(`${this.url}/${id}/reopen`, {});
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
