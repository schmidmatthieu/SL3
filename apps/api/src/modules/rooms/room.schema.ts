import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types, model } from 'mongoose';
import { slugify } from '../../utils/slugify';

export type RoomDocument = Room & Document;

export enum RoomStatus {
  UPCOMING = 'upcoming',
  LIVE = 'live',
  PAUSED = 'paused',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class RoomSettings {
  @Prop({ default: true })
  isPublic: boolean;

  @Prop({ default: true })
  chatEnabled: boolean;

  @Prop({ default: true })
  recordingEnabled: boolean;

  @Prop()
  maxParticipants?: number;

  @Prop({ default: true })
  allowQuestions: boolean;

  @Prop({ default: 'fr' })
  originalLanguage: string;

  @Prop({ type: [String], default: [] })
  availableLanguages: string[];
}

const RoomSettingsSchema = SchemaFactory.createForClass(RoomSettings);

@Schema()
export class Room {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: MongooseSchema.Types.Mixed })
  eventId: Types.ObjectId | string;

  @Prop({
    required: true,
    type: String,
    enum: RoomStatus,
    default: RoomStatus.UPCOMING,
  })
  status: RoomStatus;

  @Prop()
  description?: string;

  @Prop()
  thumbnail?: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop()
  streamKey?: string;

  @Prop()
  streamUrl?: string;

  @Prop({ type: RoomSettings })
  settings: RoomSettings;

  @Prop({ type: [{ type: Types.ObjectId }] })
  participants: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId }] })
  speakers: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId }] })
  moderators: Types.ObjectId[];

  @Prop({ required: true, type: Types.ObjectId })
  createdBy: Types.ObjectId;

  @Prop({ required: true, type: String, unique: true })
  slug: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const RoomSchema = SchemaFactory.createForClass(Room);

// Ajouter les hooks pre-save
RoomSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    return next();
  }

  let baseSlug = slugify(this.name);
  let slug = baseSlug;
  let counter = 1;

  // Utiliser this.constructor au lieu de model('Room')
  const RoomModel = this.constructor as any;
  while (await RoomModel.findOne({ slug, _id: { $ne: this._id } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  this.slug = slug;
  next();
});

// Ajouter les hooks pre-validate
RoomSchema.pre('validate', function(next) {
  if (!this.slug) {
    this.slug = slugify(this.name);
  }
  next();
});

// Ajouter les transformations
RoomSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// Ajouter l'index virtuel _id
RoomSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
