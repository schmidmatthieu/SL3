import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RecoveryLogDocument = RecoveryLog & Document;

export enum RecoveryType {
  MISSING_REFERENCE = 'missing_reference',
  ORPHANED_DATA = 'orphaned_data',
  INCONSISTENT_STATE = 'inconsistent_state',
  CORRUPTED_DATA = 'corrupted_data',
}

export enum RecoveryStatus {
  DETECTED = 'detected',
  IN_PROGRESS = 'in_progress',
  REPAIRED = 'repaired',
  FAILED = 'failed',
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class RecoveryLog {
  _id: Types.ObjectId;

  @Prop({ required: true, enum: RecoveryType })
  type: RecoveryType;

  @Prop({ required: true, enum: RecoveryStatus })
  status: RecoveryStatus;

  @Prop({ required: true })
  entity: string;

  @Prop({ type: Types.ObjectId })
  entityId?: Types.ObjectId;

  @Prop({ type: Object })
  details: {
    problem: string;
    context?: Record<string, any>;
    attemptedFixes?: string[];
  };

  @Prop()
  error?: string;

  @Prop({ type: Date })
  repairedAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const RecoveryLogSchema = SchemaFactory.createForClass(RecoveryLog);

// Indexes pour faciliter la recherche et le monitoring
RecoveryLogSchema.index({ type: 1, status: 1 });
RecoveryLogSchema.index({ entity: 1, entityId: 1 });
RecoveryLogSchema.index({ createdAt: -1 });
RecoveryLogSchema.index({ status: 1, createdAt: -1 });
