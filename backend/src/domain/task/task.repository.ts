import { Task } from './task.js';

// Port: what the application needs from task storage.
// It is an abstract class (not an interface) so Nest can also use it as the
// injection token. The PostgreSQL adapter lives in the infrastructure layer.
export abstract class TaskRepository {
  abstract findAll(): Promise<Task[]>;
  abstract findById(id: string): Promise<Task | null>;
  abstract save(task: Task): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
