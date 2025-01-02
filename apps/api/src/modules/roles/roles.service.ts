import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile, ProfileDocument } from './schemas/profile.schema';
import {
  Permission,
  PermissionDocument,
  PermissionType,
} from './schemas/permission.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Logger } from '@nestjs/common';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
    @InjectModel(Permission.name)
    private permissionModel: Model<PermissionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getRole(userId: string): Promise<string> {
    this.logger.log('Getting role for user ID:', userId);
    try {
      // First, try to get the role from the profile
      const profile = await this.profileModel.findOne({ userId }).exec();
      if (profile?.role) {
        this.logger.log('Role found in profile:', profile.role);
        return profile.role;
      }

      // If no profile role, check the user model
      const user = await this.userModel.findById(userId).exec();
      if (user?.role) {
        this.logger.log('Role found in user:', user.role);
        return user.role;
      }

      this.logger.log('No role found, defaulting to participant');
      return 'participant';
    } catch (error) {
      this.logger.error('Error getting role:', error);
      throw error;
    }
  }

  async checkPermission(
    userId: string,
    type: PermissionType,
    resourceId: string,
  ): Promise<boolean> {
    const permission = await this.permissionModel
      .findOne({
        userId,
        type,
        resourceId,
        active: true,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } },
        ],
      })
      .exec();

    return !!permission;
  }

  async grantPermission(
    userId: string,
    type: PermissionType,
    resourceId: string,
  ): Promise<Permission> {
    const permission = new this.permissionModel({
      userId,
      type,
      resourceId,
    });
    return permission.save();
  }

  async revokePermission(
    userId: string,
    type: PermissionType,
    resourceId: string,
  ): Promise<boolean> {
    const result = await this.permissionModel
      .updateOne({ userId, type, resourceId }, { active: false })
      .exec();
    return result.modifiedCount > 0;
  }
}
