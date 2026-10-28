// Shapes returned by the NestJS API.

export type TaskStatus = 'TODO' | 'DONE';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
  completedAt: string | null;
}

export type ActivityType = 'TASK_CREATED' | 'TASK_COMPLETED' | 'TASK_REOPENED' | 'TASK_DELETED';

export interface Activity {
  id: string;
  type: ActivityType;
  taskId: string;
  taskTitle: string;
  actor: string;
  occurredAt: string;
}

export interface Health {
  postgres: 'up' | 'down';
  mongo: 'up' | 'down';
}
