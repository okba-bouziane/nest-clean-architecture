import { Task } from '../task/task.js';

export type ActivityType =
  'TASK_CREATED' | 'TASK_COMPLETED' | 'TASK_REOPENED' | 'TASK_DELETED';

// An append-only event describing something that happened to a task.
export interface Activity {
  id: string;
  type: ActivityType;
  taskId: string;
  taskTitle: string;
  // Username of the authenticated caller (from Keycloak)
  actor: string;
  occurredAt: Date;
}

export function activityFor(
  type: ActivityType,
  task: Task,
  actor: string,
): Activity {
  return {
    id: crypto.randomUUID(),
    type,
    taskId: task.id,
    taskTitle: task.title,
    actor,
    occurredAt: new Date(),
  };
}
