import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User, UserRole } from '../../users/schemas/user.schema';

export type ProfileDocument = Profile & Document;

@Schema({ timestamps: true })
export class Profile {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ type: String, enum: UserRole, default: UserRole.PARTICIPANT })
  role: UserRole;

  @Prop({ type: Object })
  settings: Record<string, any>;

  @Prop({ type: Object })
  metadata: Record<string, any>;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
