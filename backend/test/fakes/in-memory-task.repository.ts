import { Task } from '../../src/domain/task/task.js';
import { TaskRepository } from '../../src/domain/task/task.repository.js';

// Test adapter for the TaskRepository port: no database needed.
export class InMemoryTaskRepository implements TaskRepository {
  private readonly rows = new Map<string, ReturnType<Task['toSnapshot']>>();

  findAll(): Promise<Task[]> {
    return Promise.resolve([...this.rows.values()].map((r) => Task.restore(r)));
  }

  findById(id: string): Promise<Task | null> {
    const row = this.rows.get(id);
    return Promise.resolve(row ? Task.restore(row) : null);
  }

  save(task: Task): Promise<void> {
    this.rows.set(task.id, task.toSnapshot());
    return Promise.resolve();
  }

  delete(id: string): Promise<void> {
    this.rows.delete(id);
    return Promise.resolve();
  }
}
