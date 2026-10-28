import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { ActivityApi } from '../../core/api/activity.api';
import { TasksApi } from '../../core/api/tasks.api';
import { AuthService } from '../../core/auth/auth.service';
import { Activity, ActivityType, Task } from '../../core/models';

@Component({
  selector: 'app-board',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './board.html',
})
export class Board {
  private readonly tasksApi = inject(TasksApi);
  private readonly activityApi = inject(ActivityApi);
  protected readonly auth = inject(AuthService);

  protected readonly tasks = signal<Task[]>([]);
  protected readonly activity = signal<Activity[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly openCount = computed(
    () => this.tasks().filter((t) => t.status === 'TODO').length,
  );
  protected readonly doneCount = computed(() => this.tasks().length - this.openCount());

  protected readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(120)],
    }),
  });

  protected readonly verbs: Record<ActivityType, string> = {
    TASK_CREATED: 'created',
    TASK_COMPLETED: 'completed',
    TASK_REOPENED: 'reopened',
    TASK_DELETED: 'deleted',
  };

  constructor() {
    this.refresh();
  }

  protected add(): void {
    const title = this.form.controls.title.value.trim();
    if (!title) return;
    this.run(this.tasksApi.create(title), () => this.form.reset());
  }

  protected toggle(task: Task): void {
    this.run(
      task.status === 'DONE' ? this.tasksApi.reopen(task.id) : this.tasksApi.complete(task.id),
    );
  }

  // Not hidden for plain users on purpose: the API enforces the admin role.
  protected remove(task: Task): void {
    this.run(this.tasksApi.remove(task.id));
  }

  private run(request: Observable<unknown>, onSuccess?: () => void): void {
    this.error.set(null);
    request.subscribe({
      next: () => {
        onSuccess?.();
        this.refresh();
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(this.messageFor(err));
        this.refresh();
      },
    });
  }

  private refresh(): void {
    forkJoin({ tasks: this.tasksApi.list(), activity: this.activityApi.latest() }).subscribe({
      next: ({ tasks, activity }) => {
        this.tasks.set(tasks);
        this.activity.set(activity);
      },
      error: (err: HttpErrorResponse) => this.error.set(this.messageFor(err)),
    });
  }

  private messageFor(err: HttpErrorResponse): string {
    const message = err.error?.message ?? err.message;
    return `${err.status}: ${Array.isArray(message) ? message.join(', ') : message}`;
  }
}
