import { OnModuleInit } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
export declare class UsersService implements OnModuleInit {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    private toObjectId;
    onModuleInit(): Promise<void>;
    createSuperAdmin(): Promise<void>;
    create(email: string, password: string, username?: string): Promise<User>;
    findOne(email: string): Promise<UserDocument | null>;
    findById(id: string | Types.ObjectId): Promise<UserDocument | null>;
    updateProfile(userId: string | Types.ObjectId, profile: Partial<User['profile']>): Promise<User>;
    validatePassword(user: User, password: string): Promise<boolean>;
    updatePassword(userId: string | Types.ObjectId, newPassword: string): Promise<void>;
    updateEmail(userId: string | Types.ObjectId, email: string): Promise<void>;
    deleteUser(userId: string | Types.ObjectId): Promise<void>;
    saveResetToken(userId: string | Types.ObjectId, token: string): Promise<void>;
    uploadAvatar(userId: string | Types.ObjectId, avatarUrl: string): Promise<void>;
    deleteAvatar(userId: string | Types.ObjectId): Promise<void>;
    findAll(page: number, limit: number, search?: string): Promise<User[]>;
    getSettings(userId: string | Types.ObjectId): Promise<any>;
    updateSettings(userId: string | Types.ObjectId, settings: any): Promise<void>;
    updateRole(userId: string | Types.ObjectId, role: string): Promise<void>;
}
