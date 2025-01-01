import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { MediaService } from '../media/media.service';
import { MediaDocument } from '../media/schemas/media.schema';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly mediaService: MediaService,
  ) {}

  async create(createUserDto: {
    email: string;
    password: string;
    username: string;
    firstName?: string;
    lastName?: string;
    bio?: string;
    imageUrl?: string;
    preferredLanguage?: string;
    theme?: string;
    role?: string;
  }): Promise<UserDocument> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    // Définir le rôle par défaut comme 'user', sauf pour le premier utilisateur qui sera admin
    const userCount = await this.userModel.countDocuments();
    const role = userCount === 0 ? 'admin' : 'user';
    
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      role,
    });
    
    this.logger.log(`Creating new user with role: ${role}`);
    return createdUser.save();
  }

  async findOne(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async count(): Promise<number> {
    return this.userModel.countDocuments().exec();
  }

  async validatePassword(user: UserDocument, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async updateProfile(userId: string, updateData: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    imageUrl?: string;
    preferredLanguage?: string;
    theme?: string;
  }): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Si l'image est modifiée, mettre à jour les utilisations
    if (updateData.imageUrl && updateData.imageUrl !== user.imageUrl) {
      // Supprimer l'ancienne utilisation si elle existe
      if (user.imageUrl) {
        const oldMediaPath = user.imageUrl.split('/uploads/')[1];
        const oldMedia = await this.mediaService.findByFilename(oldMediaPath);
        if (oldMedia) {
          await this.mediaService.removeUsage(oldMedia.id, userId);
        }
      }

      // Ajouter la nouvelle utilisation
      const newMediaPath = updateData.imageUrl.split('/uploads/')[1];
      const newMedia = await this.mediaService.findByFilename(newMediaPath);
      if (newMedia) {
        await this.mediaService.addUsage(newMedia.id, {
          type: 'profile',
          entityId: userId,
          entityName: `${updateData.firstName || user.firstName} ${updateData.lastName || user.lastName}`.trim()
        });
      }
    }

    Object.assign(user, updateData);
    return user.save();
  }

  async updatePassword(userId: string, newPassword: string): Promise<UserDocument | null> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return this.userModel.findByIdAndUpdate(
      userId,
      { $set: { password: hashedPassword } },
      { new: true }
    ).exec();
  }

  async updateAvatar(userId: string, imageUrl: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $set: { imageUrl } },
      { new: true }
    ).exec();
  }

  async deleteByEmail(email: string): Promise<boolean> {
    try {
      const result = await this.userModel.deleteOne({ email }).exec();
      this.logger.log(`Deleted user with email ${email}:`, result);
      return result.deletedCount > 0;
    } catch (error) {
      this.logger.error(`Error deleting user with email ${email}:`, error);
      throw error;
    }
  }
}
