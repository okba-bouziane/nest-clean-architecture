import { activityFor } from '../../domain/activity/activity.js';
import { ActivityLog } from '../../domain/activity/activity-log.js';
import { Task } from '../../domain/task/task.js';
import { TaskRepository } from '../../domain/task/task.repository.js';
import { getTaskOrFail } from './get-task-or-fail.js';

export class ReopenTaskUseCase {
  constructor(
    private readonly tasks: TaskRepository,
    private readonly activityLog: ActivityLog,
  ) {}

  async execute(id: string, actor: string): Promise<Task> {
    const task = await getTaskOrFail(this.tasks, id);
    task.reopen();
    await this.tasks.save(task);
    await this.activityLog.record(activityFor('TASK_REOPENED', task, actor));
    return task;
  }
}
