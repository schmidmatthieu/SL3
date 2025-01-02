import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'User login' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string' },
            username: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
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

  @ApiOperation({ summary: 'User registration' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
        username: { type: 'string', example: 'john_doe' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string' },
            username: { type: 'string' },
            role: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or email already exists',
  })
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
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        email: { type: 'string' },
        username: { type: 'string' },
        role: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Get('me')
  async getProfile(@Request() req) {
    this.logger.log(
      'Profile request received with user:',
      JSON.stringify(req.user),
    );
    try {
      if (!req.user || !req.user.id) {
        this.logger.error(
          'No user ID found in request:',
          JSON.stringify(req.user),
        );
        throw new Error('User ID not found in request');
      }

      const profile = await this.authService.getProfile(req.user.id);
      this.logger.log(
        'Profile retrieved successfully:',
        JSON.stringify(profile),
      );
      return profile;
    } catch (error) {
      this.logger.error('Error in getProfile controller:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user profile' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        username: { type: 'string', example: 'john_doe' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        email: { type: 'string' },
        username: { type: 'string' },
        role: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Put('me')
  async updateProfile(@Request() req, @Body() updateDto: UpdateUserDto) {
    this.logger.log(`Profile update request for user ID: ${req.user.id}`);
    return this.authService.updateProfile(req.user.id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        currentPassword: { type: 'string', example: 'password123' },
        newPassword: { type: 'string', example: 'newpassword123' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User password updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Put('password')
  async updatePassword(
    @Request() req,
    @Body() passwordDto: { currentPassword: string; newPassword: string },
  ) {
    this.logger.log(`Password update request for user ID: ${req.user.id}`);
    return this.authService.updatePassword(req.user.id, passwordDto);
  }
}
