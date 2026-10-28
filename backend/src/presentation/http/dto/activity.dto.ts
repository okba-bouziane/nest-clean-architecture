import { ApiProperty } from '@nestjs/swagger';
import type {
  Activity,
  ActivityType,
} from '../../../domain/activity/activity.js';

export class ActivityResponse {
  @ApiProperty() id: string;
  @ApiProperty({
    enum: ['TASK_CREATED', 'TASK_COMPLETED', 'TASK_REOPENED', 'TASK_DELETED'],
  })
  type: ActivityType;
  @ApiProperty() taskId: string;
  @ApiProperty() taskTitle: string;
  @ApiProperty() actor: string;
  @ApiProperty() occurredAt: string;

  static from(activity: Activity): ActivityResponse {
    return { ...activity, occurredAt: activity.occurredAt.toISOString() };
  }
}
