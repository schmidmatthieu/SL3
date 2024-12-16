import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile, ProfileDocument } from './schemas/profile.schema';
import { Permission, PermissionDocument, PermissionType } from './schemas/permission.schema';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
    @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
  ) {}

  async getRole(userId: string): Promise<string | null> {
    const profile = await this.profileModel.findOne({ userId }).exec();
    return profile?.role || null;
  }

  async checkPermission(userId: string, type: PermissionType, resourceId: string): Promise<boolean> {
    const permission = await this.permissionModel.findOne({
      userId,
      type,
      resourceId,
      active: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } },
      ],
    }).exec();

    return !!permission;
  }

  async grantPermission(userId: string, type: PermissionType, resourceId: string): Promise<Permission> {
    const permission = new this.permissionModel({
      userId,
      type,
      resourceId,
    });
    return permission.save();
  }

  async revokePermission(userId: string, type: PermissionType, resourceId: string): Promise<boolean> {
    const result = await this.permissionModel.updateOne(
      { userId, type, resourceId },
      { active: false }
    ).exec();
    return result.modifiedCount > 0;
  }
}
