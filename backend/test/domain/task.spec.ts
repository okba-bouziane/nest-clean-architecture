import {
  ConflictError,
  ValidationError,
} from '../../src/domain/shared/domain-errors.js';
import { Task } from '../../src/domain/task/task.js';

describe('Task (domain entity)', () => {
  it('creates a TODO task with a trimmed title', () => {
    const task = Task.create('  Write tests  ');

    expect(task.title).toBe('Write tests');
    expect(task.status).toBe('TODO');
    expect(task.completedAt).toBeNull();
  });

  it('rejects an empty or too long title', () => {
    expect(() => Task.create('   ')).toThrow(ValidationError);
    expect(() => Task.create('x'.repeat(121))).toThrow(ValidationError);
  });

  it('completes and reopens', () => {
    const task = Task.create('Ship it');

    task.complete();
    expect(task.isDone).toBe(true);
    expect(task.completedAt).toBeInstanceOf(Date);

    task.reopen();
    expect(task.status).toBe('TODO');
    expect(task.completedAt).toBeNull();
  });

  it('refuses invalid state changes', () => {
    const task = Task.create('Ship it');
    expect(() => task.reopen()).toThrow(ConflictError);

    task.complete();
    expect(() => task.complete()).toThrow(ConflictError);
  });
});
