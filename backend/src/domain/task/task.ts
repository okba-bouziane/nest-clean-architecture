import { ConflictError, ValidationError } from '../shared/domain-errors.js';

export type TaskStatus = 'TODO' | 'DONE';

export interface TaskProps {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: Date;
  completedAt: Date | null;
}

export const TASK_TITLE_MAX_LENGTH = 120;

// Pure business entity: no framework, no ORM, no database.
// All state changes go through methods that enforce the rules.
export class Task {
  private constructor(private props: TaskProps) {}

  static create(title: string): Task {
    return new Task({
      id: crypto.randomUUID(),
      title: Task.validateTitle(title),
      status: 'TODO',
      createdAt: new Date(),
      completedAt: null,
    });
  }

  // Rebuilds an existing task from storage (no validation, no new id).
  static restore(props: TaskProps): Task {
    return new Task({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get status(): TaskStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get completedAt(): Date | null {
    return this.props.completedAt;
  }

  get isDone(): boolean {
    return this.props.status === 'DONE';
  }

  complete(): void {
    if (this.isDone) {
      throw new ConflictError(`Task ${this.id} is already completed`);
    }
    this.props.status = 'DONE';
    this.props.completedAt = new Date();
  }

  reopen(): void {
    if (!this.isDone) {
      throw new ConflictError(`Task ${this.id} is not completed`);
    }
    this.props.status = 'TODO';
    this.props.completedAt = null;
  }

  toSnapshot(): TaskProps {
    return { ...this.props };
  }

  private static validateTitle(title: string): string {
    const trimmed = title?.trim() ?? '';
    if (trimmed.length === 0) {
      throw new ValidationError('Task title cannot be empty');
    }
    if (trimmed.length > TASK_TITLE_MAX_LENGTH) {
      throw new ValidationError(
        `Task title cannot exceed ${TASK_TITLE_MAX_LENGTH} characters`,
      );
    }
    return trimmed;
  }
}
