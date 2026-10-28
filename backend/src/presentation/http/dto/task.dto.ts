import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import {
  TASK_TITLE_MAX_LENGTH,
  Task,
  type TaskStatus,
} from '../../../domain/task/task.js';

export class CreateTaskDto {
  @ApiProperty({ example: 'Prepare the technical interview' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(TASK_TITLE_MAX_LENGTH)
  title: string;
}

export class TaskResponse {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty({ enum: ['TODO', 'DONE'] }) status: TaskStatus;
  @ApiProperty() createdAt: string;
  @ApiProperty({ type: String, nullable: true }) completedAt: string | null;

  static from(task: Task): TaskResponse {
    return {
      id: task.id,
      title: task.title,
      status: task.status,
      createdAt: task.createdAt.toISOString(),
      completedAt: task.completedAt?.toISOString() ?? null,
    };
  }
}
