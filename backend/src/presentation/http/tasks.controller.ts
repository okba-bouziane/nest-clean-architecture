import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CompleteTaskUseCase } from '../../application/task/complete-task.use-case.js';
import { CreateTaskUseCase } from '../../application/task/create-task.use-case.js';
import { DeleteTaskUseCase } from '../../application/task/delete-task.use-case.js';
import { ListTasksUseCase } from '../../application/task/list-tasks.use-case.js';
import { ReopenTaskUseCase } from '../../application/task/reopen-task.use-case.js';
import type { AuthUser } from './auth/auth-user.js';
import { CurrentUser, Roles } from './auth/auth.decorators.js';
import { CreateTaskDto, TaskResponse } from './dto/task.dto.js';

// Thin controller: validate input, call one use case, map the result.
@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly listTasks: ListTasksUseCase,
    private readonly createTask: CreateTaskUseCase,
    private readonly completeTask: CompleteTaskUseCase,
    private readonly reopenTask: ReopenTaskUseCase,
    private readonly deleteTask: DeleteTaskUseCase,
  ) {}

  @Get()
  async list(): Promise<TaskResponse[]> {
    const tasks = await this.listTasks.execute();
    return tasks.map((task) => TaskResponse.from(task));
  }

  @Post()
  async create(
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: AuthUser,
  ): Promise<TaskResponse> {
    const task = await this.createTask.execute({
      title: dto.title,
      actor: user.username,
    });
    return TaskResponse.from(task);
  }

  @Patch(':id/complete')
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<TaskResponse> {
    return TaskResponse.from(
      await this.completeTask.execute(id, user.username),
    );
  }

  @Patch(':id/reopen')
  async reopen(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<TaskResponse> {
    return TaskResponse.from(await this.reopenTask.execute(id, user.username));
  }

  // Only users with the Keycloak realm role "admin" can delete
  @Delete(':id')
  @Roles('admin')
  @HttpCode(204)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    await this.deleteTask.execute(id, user.username);
  }
}
