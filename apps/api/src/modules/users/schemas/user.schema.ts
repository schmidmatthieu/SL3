import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  EVENT_ADMIN = 'event_admin',
  ROOM_MODERATOR = 'room_moderator',
  ROOM_SPEAKER = 'room_speaker',
  PARTICIPANT = 'participant'
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      return {
        id: ret._id.toString(),
        email: ret.email,
        username: ret.username,
        firstName: ret.firstName || '',
        lastName: ret.lastName || '',
        bio: ret.bio || '',
        imageUrl: ret.imageUrl || '',
        preferredLanguage: ret.preferredLanguage || 'en',
        theme: ret.theme || 'system',
        role: ret.role,
        createdAt: ret.createdAt,
        updatedAt: ret.updatedAt
      };
    },
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      if (ret._id) ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      return ret;
    }
  }
})
export class User {
  @ApiProperty({
    description: 'The user email address',
    example: 'user@example.com',
  })
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @ApiProperty({
    description: 'The username',
    example: 'johndoe',
  })
  @Prop({ required: true, unique: true })
  username: string;

  @ApiProperty({
    description: 'The user role',
    example: 'participant',
  })
  @Prop({ 
    type: String, 
    required: true, 
    enum: Object.values(UserRole),
    default: UserRole.PARTICIPANT,
    immutable: true // Le rôle ne peut pas être modifié une fois défini
  })
  role: UserRole;

  @ApiProperty({
    description: 'The user first name',
    example: 'John',
  })
  @Prop()
  firstName?: string;

  @ApiProperty({
    description: 'The user last name',
    example: 'Doe',
  })
  @Prop()
  lastName?: string;

  @ApiProperty({
    description: 'The user biography',
    example: 'A short bio about me...',
  })
  @Prop()
  bio?: string;

  @ApiProperty({
    description: 'URL to the user profile image',
    example: 'https://example.com/avatar.jpg',
  })
  @Prop()
  imageUrl?: string;

  @ApiProperty({
    description: 'The preferred language for the user interface',
    example: 'en',
    default: 'en',
    enum: ['en', 'fr', 'de', 'it']
  })
  @Prop({ 
    default: 'en',
    type: String,
    enum: ['en', 'fr', 'de', 'it']
  })
  preferredLanguage: string;

  @ApiProperty({
    description: 'The preferred theme for the user interface',
    example: 'system',
    default: 'system',
  })
  @Prop({ default: 'system' })
  theme: string;

  @Prop({ default: false })
  isEmailVerified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Middleware pour le nettoyage des champs
UserSchema.pre('save', function(next) {
  ['firstName', 'lastName', 'bio'].forEach(field => {
    if (this[field]) {
      this[field] = this[field].trim();
    }
  });
  next();
});

UserSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as any;
  if (update) {
    ['firstName', 'lastName', 'bio'].forEach(field => {
      if (update[field]) {
        update[field] = update[field].trim();
      }
    });
  }
  next();
});
