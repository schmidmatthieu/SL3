import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User, UserRole } from '../../users/schemas/user.schema';

export type PermissionDocument = Permission & Document;

/**
 * Types de permissions spécifiques qui peuvent être accordées
 * Aligné avec UserRole mais plus granulaire pour des permissions spécifiques
 */
export enum PermissionType {
  EVENT_ADMIN = 'event_admin',
  EVENT_MODERATOR = 'event_moderator',
  ROOM_MODERATOR = 'room_moderator',
  ROOM_SPEAKER = 'room_speaker',
  CHAT_MODERATOR = 'chat_moderator',
  PARTICIPANT = 'participant',
}

@Schema({ timestamps: true })
export class Permission {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({ type: String, enum: PermissionType, required: true })
  type: PermissionType;

  @Prop({ type: String, required: true })
  resourceId: string;

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Prop({ type: Date })
  expiresAt?: Date;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

// Indexes
PermissionSchema.index({ userId: 1, resourceId: 1, type: 1 }, { unique: true });
PermissionSchema.index({ resourceId: 1 });
PermissionSchema.index({ expiresAt: 1 }, { sparse: true });

// Virtuals
PermissionSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

/**
 * Convertit un UserRole en PermissionType correspondant
 */
export function mapUserRoleToPermissionType(role: UserRole): PermissionType {
  switch (role) {
    case UserRole.ADMIN:
      return PermissionType.EVENT_ADMIN;
    case UserRole.EVENT_ADMIN:
      return PermissionType.EVENT_ADMIN;
    case UserRole.ROOM_MODERATOR:
      return PermissionType.ROOM_MODERATOR;
    case UserRole.ROOM_SPEAKER:
      return PermissionType.ROOM_SPEAKER;
    default:
      return PermissionType.PARTICIPANT;
  }
}
