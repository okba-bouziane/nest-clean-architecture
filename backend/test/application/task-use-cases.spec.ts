import { ListActivityUseCase } from '../../src/application/activity/list-activity.use-case.js';
import { CompleteTaskUseCase } from '../../src/application/task/complete-task.use-case.js';
import { CreateTaskUseCase } from '../../src/application/task/create-task.use-case.js';
import { DeleteTaskUseCase } from '../../src/application/task/delete-task.use-case.js';
import { ListTasksUseCase } from '../../src/application/task/list-tasks.use-case.js';
import { ReopenTaskUseCase } from '../../src/application/task/reopen-task.use-case.js';
import { NotFoundError } from '../../src/domain/shared/domain-errors.js';
import { InMemoryActivityLog } from '../fakes/in-memory-activity.log.js';
import { InMemoryTaskRepository } from '../fakes/in-memory-task.repository.js';

// The use cases only depend on ports, so they run here with in-memory
// adapters: no PostgreSQL, no MongoDB, no Keycloak, no Nest.
describe('Task use cases', () => {
  let tasks: InMemoryTaskRepository;
  let activityLog: InMemoryActivityLog;

  beforeEach(() => {
    tasks = new InMemoryTaskRepository();
    activityLog = new InMemoryActivityLog();
  });

  const create = (title: string) =>
    new CreateTaskUseCase(tasks, activityLog).execute({
      title,
      actor: 'alice',
    });

  it('creates a task and records who created it', async () => {
    const task = await create('Prepare demo');

    expect(await tasks.findById(task.id)).not.toBeNull();
    expect(activityLog.events).toMatchObject([
      { type: 'TASK_CREATED', taskId: task.id, actor: 'alice' },
    ]);
  });

  it('lists tasks', async () => {
    await create('One');
    await create('Two');

    const list = await new ListTasksUseCase(tasks).execute();
    expect(list.map((t) => t.title).sort()).toEqual(['One', 'Two']);
  });

  it('completes then reopens a task', async () => {
    const { id } = await create('Review PR');

    const done = await new CompleteTaskUseCase(tasks, activityLog).execute(
      id,
      'bob',
    );
    expect(done.status).toBe('DONE');
    expect((await tasks.findById(id))?.status).toBe('DONE');

    const reopened = await new ReopenTaskUseCase(tasks, activityLog).execute(
      id,
      'bob',
    );
    expect(reopened.status).toBe('TODO');
    expect(activityLog.events.map((e) => e.type)).toEqual([
      'TASK_CREATED',
      'TASK_COMPLETED',
      'TASK_REOPENED',
    ]);
  });

  it('deletes a task and keeps its title in the activity log', async () => {
    const { id } = await create('Old task');

    await new DeleteTaskUseCase(tasks, activityLog).execute(id, 'bob');

    expect(await tasks.findById(id)).toBeNull();
    expect(activityLog.events.at(-1)).toMatchObject({
      type: 'TASK_DELETED',
      taskTitle: 'Old task',
      actor: 'bob',
    });
  });

  it('throws NotFoundError for an unknown task', async () => {
    const complete = new CompleteTaskUseCase(tasks, activityLog);

    await expect(complete.execute(crypto.randomUUID(), 'bob')).rejects.toThrow(
      NotFoundError,
    );
    expect(activityLog.events).toHaveLength(0);
  });

  it('returns the latest activity first and clamps the limit', async () => {
    await create('First');
    await create('Second');

    const latest = await new ListActivityUseCase(activityLog).execute(500);
    expect(latest.map((a) => a.taskTitle)).toEqual(['Second', 'First']);
  });
});
