import { Activity } from '../../domain/activity/activity.js';
import { ActivityLog } from '../../domain/activity/activity-log.js';

export class ListActivityUseCase {
  static readonly MAX_LIMIT = 100;

  constructor(private readonly activityLog: ActivityLog) {}

  execute(limit = 20): Promise<Activity[]> {
    const safeLimit = Math.min(
      Math.max(limit, 1),
      ListActivityUseCase.MAX_LIMIT,
    );
    return this.activityLog.latest(safeLimit);
  }
}
