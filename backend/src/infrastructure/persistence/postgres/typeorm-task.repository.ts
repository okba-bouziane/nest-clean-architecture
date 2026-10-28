import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../../domain/task/task.js';
import { TaskRepository } from '../../../domain/task/task.repository.js';
import { TaskMapper } from './task.mapper.js';
import { TaskOrmEntity } from './task.orm-entity.js';

// Adapter: implements the TaskRepository port with PostgreSQL (TypeORM).
@Injectable()
export class TypeOrmTaskRepository implements TaskRepository {
  constructor(
    @InjectRepository(TaskOrmEntity)
    private readonly repo: Repository<TaskOrmEntity>,
  ) {}

  async findAll(): Promise<Task[]> {
    const rows = await this.repo.find({ order: { createdAt: 'DESC' } });
    return rows.map((row) => TaskMapper.toDomain(row));
  }

  async findById(id: string): Promise<Task | null> {
    const row = await this.repo.findOneBy({ id });
    return row ? TaskMapper.toDomain(row) : null;
  }

  async save(task: Task): Promise<void> {
    await this.repo.save(TaskMapper.toPersistence(task));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
