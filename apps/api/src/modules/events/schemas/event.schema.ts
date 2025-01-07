import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Room } from '../../rooms/room.schema';
import { slugify } from '../../../utils/slugify';

export enum EventStatus {
  ACTIVE = 'active',
  SCHEDULED = 'scheduled',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

export type EventDocument = Event & Document;

interface EventDocumentWithId extends EventDocument {
  _id: Types.ObjectId;
}

@Schema({
  timestamps: true,
  collection: 'events',
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      // Convertir les dates en chaînes ISO
      if (ret.startDateTime) {
        ret.startDateTime = ret.startDateTime.toISOString();
      }
      if (ret.endDateTime) {
        ret.endDateTime = ret.endDateTime.toISOString();
      }
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

  @Prop({ type: Boolean, default: false })
  featured: boolean;

  @Prop({
    type: String,
    enum: Object.values(EventStatus),
    default: EventStatus.SCHEDULED,
  })
  status: EventStatus;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Room' }],
    default: [],
  })
  rooms: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: string;

  @Prop({ required: true, type: String, unique: true })
  slug: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const EventSchema = SchemaFactory.createForClass(Event);

// Middleware to generate slug before saving
EventSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title);
  }
  next();
});

// Ensure unique slug
EventSchema.pre('save', async function(next) {
  if (this.isModified('slug')) {
    const slugRegEx = new RegExp(`^${this.slug}(-[0-9]*)?$`, 'i');
    const eventsWithSlug = await (this.model('Event') as any).find({ slug: slugRegEx });
    if (eventsWithSlug.length > 0) {
      this.slug = `${this.slug}-${eventsWithSlug.length + 1}`;
    }
  }
  next();
});

// Virtual pour l'id
EventSchema.virtual('id').get(function(this: EventDocumentWithId) {
  return this._id.toHexString();
});

// Indexes
EventSchema.index({ createdBy: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ startDateTime: 1 });
EventSchema.index({ endDateTime: 1 });
