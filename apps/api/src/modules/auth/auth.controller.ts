import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: { email: string; password: string }) {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      this.logger.warn(`Failed login attempt for email: ${loginDto.email}`);
      throw new Error('Invalid credentials');
    }
    this.logger.log(`Successful login for email: ${loginDto.email}`);
    return this.authService.login(user);
  }

  @Post('signup')
  async signup(
    @Body() signupDto: { email: string; password: string; username: string },
  ) {
    this.logger.log(`Signup attempt for email: ${signupDto.email}`);
    try {
      const result = await this.authService.signup(signupDto);
      this.logger.log(`Successful signup for email: ${signupDto.email}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Signup failed for email: ${signupDto.email}`,
        error.stack,
      );
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    this.logger.log(`Profile request for user ID: ${req.user.id}`);
    return this.authService.getProfile(req.user.id);
  }
}
