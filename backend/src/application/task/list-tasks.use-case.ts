import { Task } from '../../domain/task/task.js';
import { TaskRepository } from '../../domain/task/task.repository.js';

export class ListTasksUseCase {
  constructor(private readonly tasks: TaskRepository) {}

  execute(): Promise<Task[]> {
    return this.tasks.findAll();
  }
}
