import { activityFor } from '../../domain/activity/activity.js';
import { ActivityLog } from '../../domain/activity/activity-log.js';
import { Task } from '../../domain/task/task.js';
import { TaskRepository } from '../../domain/task/task.repository.js';

export interface CreateTaskInput {
  title: string;
  actor: string;
}

export class CreateTaskUseCase {
  constructor(
    private readonly tasks: TaskRepository,
    private readonly activityLog: ActivityLog,
  ) {}

  async execute(input: CreateTaskInput): Promise<Task> {
    const task = Task.create(input.title);
    await this.tasks.save(task);
    await this.activityLog.record(
      activityFor('TASK_CREATED', task, input.actor),
    );
    return task;
  }
}
