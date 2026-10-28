import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { Activity } from '../../../domain/activity/activity.js';
import { ActivityLog } from '../../../domain/activity/activity-log.js';
import { ActivityDocument } from './activity.schema.js';

// Adapter: implements the ActivityLog port with MongoDB (Mongoose).
@Injectable()
export class MongoActivityLog implements ActivityLog {
  constructor(
    @InjectModel(ActivityDocument.name)
    private readonly model: Model<ActivityDocument>,
  ) {}

  async record(activity: Activity): Promise<void> {
    const { id, ...rest } = activity;
    await this.model.create({ _id: id, ...rest });
  }

  async latest(limit: number): Promise<Activity[]> {
    const docs = await this.model
      .find()
      .sort({ occurredAt: -1 })
      .limit(limit)
      .lean()
      .exec();
    return docs.map(({ _id, ...rest }) => ({ id: _id, ...rest }));
  }
}
