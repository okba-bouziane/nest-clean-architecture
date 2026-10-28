import { NotFoundError } from '../../domain/shared/domain-errors.js';
import { Task } from '../../domain/task/task.js';
import { TaskRepository } from '../../domain/task/task.repository.js';

export async function getTaskOrFail(
  tasks: TaskRepository,
  id: string,
): Promise<Task> {
  const task = await tasks.findById(id);
  if (!task) {
    throw new NotFoundError(`Task ${id} not found`);
  }
  return task;
}
