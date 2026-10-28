import { Column, Entity, PrimaryColumn } from 'typeorm';
import type { TaskStatus } from '../../../domain/task/task.js';

// Database shape of a task. Kept separate from the domain entity so the
// domain never depends on TypeORM decorators.
@Entity('tasks')
export class TaskOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  title: string;

  @Column({ type: 'varchar', length: 10 })
  status: TaskStatus;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;
}
