import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && (await this.usersService.validatePassword(user, password))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    this.logger.log('Login - User:', JSON.stringify(user));
    const payload = { email: user.email, sub: user._id || user.id };
    this.logger.log('Login - JWT Payload:', JSON.stringify(payload));
    const role = await this.rolesService.getRole(user._id || user.id);
    this.logger.log('Login - Role:', role);
    const userResponse = {
      id: user._id || user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      preferredLanguage: user.preferredLanguage,
      theme: user.theme,
      role,
    };
    this.logger.log('Login - User Response:', JSON.stringify(userResponse));
    return {
      token: this.jwtService.sign(payload),
      user: userResponse,
    };
  }

  async signup(signupDto: {
    email: string;
    password: string;
    username: string;
  }) {
    this.logger.log('Starting signup process for:', signupDto.email);

    const existingUser = await this.usersService.findOne(signupDto.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Vérifier si c'est le premier utilisateur
    const userCount = await this.usersService.count();
    const role = userCount === 0 ? UserRole.ADMIN : UserRole.PARTICIPANT;

    const user = await this.usersService.create({
      ...signupDto,
      role,
    });

    this.logger.log(`User created with role: ${role}`);
    return this.login(user);
  }

  async getProfile(userId: string) {
    this.logger.log('Getting profile for user ID:', userId);

    const user = await this.usersService.findById(userId);
    if (!user) {
      this.logger.error('User not found');
      return null;
    }

    this.logger.log('User found:', 'yes');
    this.logger.log('User object created:', user);

    // Utiliser directement le rôle de l'utilisateur
    const role = user.role;
    this.logger.log('Role retrieved:', role);

    const profile = {
      id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      preferredLanguage: user.preferredLanguage,
      theme: user.theme,
      role: role,
    };

    this.logger.log('Final profile result:', profile);
    return profile;
  }

  async updateProfile(userId: string, updateDto: any) {
    this.logger.log('Updating profile for user:', userId);

    try {
      const updatedUser = await this.usersService.updateProfile(
        userId,
        updateDto,
      );
      if (!updatedUser) {
        throw new Error('User not found');
      }

      // Le mot de passe est déjà supprimé par le schéma
      const userObject = updatedUser.toObject();
      const role = await this.rolesService.getRole(userId);

      return {
        ...userObject,
        role,
      };
    } catch (error) {
      this.logger.error('Error updating profile:', error);
      throw error;
    }
  }

  async updatePassword(
    userId: string,
    passwordDto: { currentPassword: string; newPassword: string },
  ) {
    this.logger.log('Updating password for user:', userId);

    try {
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const isValid = await this.usersService.validatePassword(
        user,
        passwordDto.currentPassword,
      );
      if (!isValid) {
        throw new Error('Current password is incorrect');
      }

      await this.usersService.updatePassword(userId, passwordDto.newPassword);
      return { message: 'Password updated successfully' };
    } catch (error) {
      this.logger.error('Error updating password:', error);
      throw error;
    }
  }
}
