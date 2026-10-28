import { InjectionToken, Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListActivityUseCase } from './application/activity/list-activity.use-case.js';
import { CompleteTaskUseCase } from './application/task/complete-task.use-case.js';
import { CreateTaskUseCase } from './application/task/create-task.use-case.js';
import { DeleteTaskUseCase } from './application/task/delete-task.use-case.js';
import { ListTasksUseCase } from './application/task/list-tasks.use-case.js';
import { ReopenTaskUseCase } from './application/task/reopen-task.use-case.js';
import { ActivityLog } from './domain/activity/activity-log.js';
import { TaskRepository } from './domain/task/task.repository.js';
import {
  ActivityDocument,
  ActivitySchema,
} from './infrastructure/persistence/mongo/activity.schema.js';
import { MongoActivityLog } from './infrastructure/persistence/mongo/mongo-activity.log.js';
import { TaskOrmEntity } from './infrastructure/persistence/postgres/task.orm-entity.js';
import { TypeOrmTaskRepository } from './infrastructure/persistence/postgres/typeorm-task.repository.js';
import { ActivityController } from './presentation/http/activity.controller.js';
import { TasksController } from './presentation/http/tasks.controller.js';

// Use cases are plain classes with no Nest decorators, so they are built here
// with factories. This module is the only place that knows which adapter
// (PostgreSQL, MongoDB, in-memory...) backs each port.
function useCase<T>(
  useCaseClass: new (...deps: any[]) => T,
  deps: InjectionToken[],
): Provider {
  return {
    provide: useCaseClass,
    useFactory: (...resolved: unknown[]) => new useCaseClass(...resolved),
    inject: deps,
  };
}

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskOrmEntity]),
    MongooseModule.forFeature([
      { name: ActivityDocument.name, schema: ActivitySchema },
    ]),
  ],
  controllers: [TasksController, ActivityController],
  providers: [
    // Ports -> adapters
    { provide: TaskRepository, useClass: TypeOrmTaskRepository },
    { provide: ActivityLog, useClass: MongoActivityLog },

    // Use cases
    useCase(ListTasksUseCase, [TaskRepository]),
    useCase(CreateTaskUseCase, [TaskRepository, ActivityLog]),
    useCase(CompleteTaskUseCase, [TaskRepository, ActivityLog]),
    useCase(ReopenTaskUseCase, [TaskRepository, ActivityLog]),
    useCase(DeleteTaskUseCase, [TaskRepository, ActivityLog]),
    useCase(ListActivityUseCase, [ActivityLog]),
  ],
})
export class TasksModule {}
