import { activityFor } from '../../domain/activity/activity.js';
import { ActivityLog } from '../../domain/activity/activity-log.js';
import { TaskRepository } from '../../domain/task/task.repository.js';
import { getTaskOrFail } from './get-task-or-fail.js';

export class DeleteTaskUseCase {
  constructor(
    private readonly tasks: TaskRepository,
    private readonly activityLog: ActivityLog,
  ) {}

  async execute(id: string, actor: string): Promise<void> {
    const task = await getTaskOrFail(this.tasks, id);
    await this.tasks.delete(task.id);
    await this.activityLog.record(activityFor('TASK_DELETED', task, actor));
  }
}
