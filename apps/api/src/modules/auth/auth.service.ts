import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private rolesService: RolesService,
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
    const user = await this.usersService.create(signupDto);
    return this.login(user);
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { password, ...userWithoutPassword } = user.toObject();
    const role = await this.rolesService.getRole(userId);
    
    return { 
      user: userWithoutPassword,
      profile: { role }
    };
  }
}
