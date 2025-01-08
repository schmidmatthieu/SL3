import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile, ProfileDocument } from './schemas/profile.schema';
import {
  Permission,
  PermissionDocument,
  PermissionType,
  mapUserRoleToPermissionType,
} from './schemas/permission.schema';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
    @InjectModel(Permission.name)
    private permissionModel: Model<PermissionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getRole(userId: string): Promise<UserRole> {
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
      return UserRole.PARTICIPANT;
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
    try {
      // Vérifier d'abord le rôle de l'utilisateur
      const userRole = await this.getRole(userId);
      
      // Les admins ont toutes les permissions
      if (userRole === UserRole.ADMIN) {
        return true;
      }

      // Convertir le rôle en type de permission
      const defaultPermission = mapUserRoleToPermissionType(userRole);
      
      // Si le rôle par défaut correspond au type demandé, autoriser
      if (defaultPermission === type) {
        return true;
      }

      // Sinon, vérifier les permissions spécifiques
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
    } catch (error) {
      this.logger.error('Error checking permission:', error);
      throw error;
    }
  }

  async grantPermission(
    userId: string,
    type: PermissionType,
    resourceId: string,
    grantedBy?: string,
  ): Promise<Permission> {
    try {
      // Vérifier si l'utilisateur existe
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Vérifier si une permission active existe déjà
      const existingPermission = await this.permissionModel
        .findOne({
          userId,
          type,
          resourceId,
          active: true,
        })
        .exec();

      if (existingPermission) {
        return existingPermission;
      }

      // Créer une nouvelle permission
      const permission = new this.permissionModel({
        userId,
        type,
        resourceId,
        grantedBy,
        grantedAt: new Date(),
      });

      this.logger.log(`Granting permission ${type} for user ${userId} on resource ${resourceId}`);
      return permission.save();
    } catch (error) {
      this.logger.error('Error granting permission:', error);
      throw error;
    }
  }

  async revokePermission(
    userId: string,
    type: PermissionType,
    resourceId: string,
    revokedBy?: string,
  ): Promise<boolean> {
    try {
      const result = await this.permissionModel
        .updateOne(
          { userId, type, resourceId, active: true },
          {
            active: false,
            revokedBy,
            revokedAt: new Date(),
          },
        )
        .exec();

      this.logger.log(
        `Revoked permission ${type} for user ${userId} on resource ${resourceId}`,
        result.modifiedCount > 0 ? 'Success' : 'No permission found',
      );

      return result.modifiedCount > 0;
    } catch (error) {
      this.logger.error('Error revoking permission:', error);
      throw error;
    }
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      return this.permissionModel
        .find({
          userId,
          active: true,
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } },
          ],
        })
        .exec();
    } catch (error) {
      this.logger.error('Error getting user permissions:', error);
      throw error;
    }
  }

  async getResourcePermissions(resourceId: string): Promise<Permission[]> {
    try {
      return this.permissionModel
        .find({
          resourceId,
          active: true,
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: { $gt: new Date() } },
          ],
        })
        .populate('userId', 'username email')
        .exec();
    } catch (error) {
      this.logger.error('Error getting resource permissions:', error);
      throw error;
    }
  }
}
