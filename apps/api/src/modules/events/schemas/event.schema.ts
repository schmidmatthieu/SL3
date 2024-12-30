import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type EventDocument = Event & Document;

export type EventStatus = 'active' | 'scheduled' | 'ended' | 'cancelled';

@Schema({
  timestamps: true,
  collection: 'events',
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Event extends Document {
  @Prop({ required: true, type: String })
  title: string;

  @Prop({ required: true, type: String })
  description: string;

  @Prop({ required: true, type: Date })
  startDateTime: Date;

  @Prop({ required: true, type: Date })
  endDateTime: Date;

  @Prop({ type: String })
  imageUrl?: string;

  @Prop({ 
    type: String, 
    enum: ['active', 'scheduled', 'ended', 'cancelled'],
    default: 'scheduled'
  })
  status: EventStatus;

  @Prop({ type: Number, min: 1, default: 1 })
  rooms: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Indexes
EventSchema.index({ createdBy: 1 });
EventSchema.index({ startDateTime: 1 });
EventSchema.index({ status: 1 });

// Virtuals
EventSchema.virtual('isLive').get(function() {
  return this.status === 'active';
});
