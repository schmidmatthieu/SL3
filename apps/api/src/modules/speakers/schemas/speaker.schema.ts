import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type SpeakerDocument = Speaker & Document;

@Schema({
  timestamps: true,
  collection: 'speakers',
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
export class Speaker extends Document {
  @Prop({ required: true, type: String })
  firstName: string;

  @Prop({ required: true, type: String })
  lastName: string;

  @Prop({ type: String })
  imageUrl?: string = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

  @Prop({ type: [String], default: [] })
  rooms?: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Event', required: true })
  eventId: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const SpeakerSchema = SchemaFactory.createForClass(Speaker);

// Indexes
SpeakerSchema.index({ eventId: 1 });
SpeakerSchema.index({ rooms: 1 });

// Virtuals
SpeakerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});
