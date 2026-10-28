import { Task } from '../../../domain/task/task.js';
import { TaskOrmEntity } from './task.orm-entity.js';

export const TaskMapper = {
  toDomain(row: TaskOrmEntity): Task {
    return Task.restore({
      id: row.id,
      title: row.title,
      status: row.status,
      createdAt: row.createdAt,
      completedAt: row.completedAt,
    });
  },

  toPersistence(task: Task): TaskOrmEntity {
    return Object.assign(new TaskOrmEntity(), task.toSnapshot());
  },
};
