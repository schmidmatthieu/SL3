import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  private toObjectId(id: string | Types.ObjectId): Types.ObjectId {
    return typeof id === 'string' ? new Types.ObjectId(id) : id;
  }

  async onModuleInit() {
    await this.createSuperAdmin();
  }

  async createSuperAdmin() {
    const email = 'matthieu@ark.swiss';
    const password = '159753Yxc!';
    const username = 'Matthieu Schmid';
    const role = 'super-admin';

    const existingUser = await this.findOne(email);
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new this.userModel({
        email,
        password: hashedPassword,
        username,
        role,
      });
      await user.save();
      console.log('Super admin user created:', email);
    } else {
      console.log('Super admin user already exists:', email);
    }
  }

  async create(email: string, password: string, username?: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({
      email,
      password: hashedPassword,
      username: username || email.split('@')[0],
    });
    return user.save();
  }

  async findOne(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string | Types.ObjectId): Promise<UserDocument | null> {
    return this.userModel.findById(this.toObjectId(id)).exec();
  }

  async updateProfile(userId: string | Types.ObjectId, profile: Partial<User['profile']>): Promise<User> {
    return this.userModel
      .findByIdAndUpdate(this.toObjectId(userId), { $set: { profile } }, { new: true })
      .exec();
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  async updatePassword(userId: string | Types.ObjectId, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userModel
      .findByIdAndUpdate(this.toObjectId(userId), { password: hashedPassword })
      .exec();
  }

  async updateEmail(userId: string | Types.ObjectId, email: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(this.toObjectId(userId), { email })
      .exec();
  }

  async deleteUser(userId: string | Types.ObjectId): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(this.toObjectId(userId)).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async saveResetToken(userId: string | Types.ObjectId, token: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(this.toObjectId(userId), { resetToken: token })
      .exec();
  }

  async uploadAvatar(userId: string | Types.ObjectId, avatarUrl: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(this.toObjectId(userId), { 'profile.avatar': avatarUrl })
      .exec();
  }

  async deleteAvatar(userId: string | Types.ObjectId): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(this.toObjectId(userId), { $unset: { 'profile.avatar': 1 } })
      .exec();
  }

  async findAll(page: number, limit: number, search?: string): Promise<User[]> {
    const query = search ? { email: new RegExp(search, 'i') } : {};
    return this.userModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  async getSettings(userId: string | Types.ObjectId): Promise<any> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.settings;
  }

  async updateSettings(userId: string | Types.ObjectId, settings: any): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(this.toObjectId(userId), { settings })
      .exec();
  }

  async updateRole(userId: string | Types.ObjectId, role: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(this.toObjectId(userId), { role }, { new: true }).exec();
  }
}
