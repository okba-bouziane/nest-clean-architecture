import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, timer } from 'rxjs';
import { ActivityApi } from './core/api/activity.api';
import { AuthService } from './core/auth/auth.service';
import { Health } from './core/models';
import { Board } from './features/board/board';

const DOWN: Health = { postgres: 'down', mongo: 'down' };

@Component({
  selector: 'app-root',
  imports: [Board],
  templateUrl: './app.html',
})
export class App {
  private readonly activityApi = inject(ActivityApi);
  protected readonly auth = inject(AuthService);

  // Polls /api/health every 10s so the status chips stay live.
  protected readonly health = toSignal(
    timer(0, 10_000).pipe(
      switchMap(() => this.activityApi.health().pipe(catchError(() => of(DOWN)))),
    ),
    { initialValue: null },
  );
}
