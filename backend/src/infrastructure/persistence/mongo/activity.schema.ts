import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { ActivityType } from '../../../domain/activity/activity.js';

// MongoDB document for the activity log: append-only, schema-flexible,
// a good fit for event/audit data.
@Schema({ collection: 'activity_log', versionKey: false })
export class ActivityDocument {
  @Prop({ type: String })
  _id: string;

  @Prop({ type: String, required: true })
  type: ActivityType;

  @Prop({ type: String, required: true, index: true })
  taskId: string;

  @Prop({ type: String, required: true })
  taskTitle: string;

  @Prop({ type: String, required: true })
  actor: string;

  @Prop({ type: Date, required: true, index: true })
  occurredAt: Date;
}

export const ActivitySchema = SchemaFactory.createForClass(ActivityDocument);
