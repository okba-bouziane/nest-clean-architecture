import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ListActivityUseCase } from '../../application/activity/list-activity.use-case.js';
import { ActivityResponse } from './dto/activity.dto.js';

@ApiTags('activity')
@ApiBearerAuth()
@Controller('activity')
export class ActivityController {
  constructor(private readonly listActivity: ListActivityUseCase) {}

  @Get()
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  async list(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<ActivityResponse[]> {
    const activity = await this.listActivity.execute(limit);
    return activity.map((item) => ActivityResponse.from(item));
  }
}
