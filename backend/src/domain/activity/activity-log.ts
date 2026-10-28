import { Activity } from './activity.js';

// Port: an append-only log of task events. The MongoDB adapter implements it.
export abstract class ActivityLog {
  abstract record(activity: Activity): Promise<void>;
  abstract latest(limit: number): Promise<Activity[]>;
}
