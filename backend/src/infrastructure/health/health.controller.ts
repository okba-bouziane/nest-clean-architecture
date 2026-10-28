import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiTags } from '@nestjs/swagger';
import type { Connection } from 'mongoose';
import { DataSource } from 'typeorm';
import { Public } from '../../presentation/http/auth/auth.decorators.js';

type Status = 'up' | 'down';

@ApiTags('health')
@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly dataSource: DataSource,
    @InjectConnection() private readonly mongo: Connection,
  ) {}

  @Get()
  async check(): Promise<{ postgres: Status; mongo: Status }> {
    const [postgres, mongo] = await Promise.all([
      this.probe(() => this.dataSource.query('SELECT 1')),
      this.probe(() => this.mongo.db!.admin().ping()),
    ]);
    return { postgres, mongo };
  }

  private async probe(ping: () => Promise<unknown>): Promise<Status> {
    try {
      await ping();
      return 'up';
    } catch {
      return 'down';
    }
  }
}
