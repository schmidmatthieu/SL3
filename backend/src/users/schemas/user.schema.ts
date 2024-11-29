import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  username: string;

  @Prop({ default: [] })
  roles: string[];

  @Prop({ type: Object, default: {} })
  profile: {
    avatar?: string;
    bio?: string;
    website?: string;
  };

  @Prop({ type: Object, default: {} })
  settings: Record<string, any>;

  @Prop({ default: true })
  isActive: boolean;

  get id() {
    return this._id;
  }

  toObject(): any {
    const obj = this as any;
    return obj;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
