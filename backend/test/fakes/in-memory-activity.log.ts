import { Activity } from '../../src/domain/activity/activity.js';
import { ActivityLog } from '../../src/domain/activity/activity-log.js';

// Test adapter for the ActivityLog port.
export class InMemoryActivityLog implements ActivityLog {
  readonly events: Activity[] = [];

  record(activity: Activity): Promise<void> {
    this.events.push(activity);
    return Promise.resolve();
  }

  latest(limit: number): Promise<Activity[]> {
    return Promise.resolve([...this.events].reverse().slice(0, limit));
  }
}
