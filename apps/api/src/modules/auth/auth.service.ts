import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { ProfilesService } from '../profiles/profiles.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,
    private profilesService: ProfilesService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && await this.usersService.validatePassword(user, password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id };
    const profile = await this.rolesService.getRole(user._id);
    return {
      user,
      profile: { role: profile },
      token: this.jwtService.sign(payload),
    };
  }

  async signup(signupDto: { email: string; password: string; username: string }) {
    const existingUser = await this.usersService.findOne(signupDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.usersService.create(signupDto);
    
    // Create default profile for new user
    try {
      await this.profilesService.create(user._id.toString());
    } catch (error) {
      this.logger.error('Failed to create profile for new user', error);
      // Continue even if profile creation fails
    }

    return this.login(user);
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { password, ...userWithoutPassword } = user.toObject();
    const role = await this.rolesService.getRole(userId);
    const profile = await this.profilesService.findByUserId(userId)
      .catch(() => null); // Return null if profile doesn't exist
    
    return { 
      user: userWithoutPassword,
      profile: { 
        ...profile?.toObject(),
        role 
      }
    };
  }
}
