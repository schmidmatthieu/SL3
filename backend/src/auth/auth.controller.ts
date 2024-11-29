import { Controller, Post, Body, UseGuards, Request, Get, Delete, Put, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('username') username?: string,
  ) {
    return this.authService.register(email, password, username);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refreshToken(@Request() req) {
    return this.authService.refreshToken(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(204)
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('password')
  async updatePassword(
    @Request() req,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.updatePassword(req.user.id, currentPassword, newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Put('email')
  async updateEmail(
    @Request() req,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.updateEmail(req.user.id, email, password);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('account')
  @HttpCode(204)
  async deleteAccount(
    @Request() req,
    @Body('password') password: string,
  ) {
    return this.authService.deleteAccount(req.user.id, password);
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body('email') email: string,
  ) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    return this.authService.resetPassword(token, password);
  }

  @Post('callback')
  async handleCallback(
    @Body('code') code: string,
  ) {
    return this.authService.handleCallback(code);
  }
}
