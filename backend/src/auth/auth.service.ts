import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Document } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValidPassword = await this.usersService.validatePassword(user, password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { password: _, ...result } = user.toObject();
    return result;
  }

  async login(user: any) {
    if (!user || !user._id) {
      throw new UnauthorizedException('Invalid user data');
    }

    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        profile: user.profile,
        role: user.role,
      },
    };
  }

  async register(email: string, password: string, username?: string) {
    // Check if user already exists
    const existingUser = await this.usersService.findOne(email);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const user = await this.usersService.create(email, password, username) as UserDocument;
    return this.login(user);
  }

  async refreshToken(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.login(user);
  }

  async logout(userId: string) {
    // Implement any cleanup needed for logout
    return { success: true };
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isValid = await this.usersService.validatePassword(user, currentPassword);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    await this.usersService.updatePassword(userId, newPassword);
    return { success: true };
  }

  async updateEmail(userId: string, email: string, password: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isValid = await this.usersService.validatePassword(user, password);
    if (!isValid) {
      throw new UnauthorizedException('Password is incorrect');
    }

    await this.usersService.updateEmail(userId, email);
    return { success: true };
  }

  async deleteAccount(userId: string, password: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isValid = await this.usersService.validatePassword(user, password);
    if (!isValid) {
      throw new UnauthorizedException('Password is incorrect');
    }

    await this.usersService.deleteUser(userId);
    return { success: true };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // TODO: Implement email sending logic
    const resetToken = this.jwtService.sign(
      { email: user.email },
      { expiresIn: '1h' }
    );

    await this.usersService.saveResetToken(user._id.toString(), resetToken);
    return { success: true };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.usersService.findOne(decoded.email);
      
      if (!user) {
        throw new BadRequestException('Invalid token');
      }

      await this.usersService.updatePassword(user._id.toString(), newPassword);
      return { success: true };
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  async handleCallback(code: string) {
    // TODO: Implement OAuth callback handling
    throw new Error('OAuth callback not implemented');
  }
}
