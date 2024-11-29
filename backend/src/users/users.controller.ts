import { Controller, Get, Post, Body, Put, Delete, UseGuards, Request, UseInterceptors, UploadedFile, Query, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request as ExpressRequest } from 'express';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: ExpressRequest) {
    const user = await this.usersService.findById(req.user.id);
    const { password, ...result } = user.toObject();
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @Request() req: ExpressRequest,
    @Body() profileData: UpdateProfileDto
  ) {
    const user = await this.usersService.updateProfile(req.user.id, profileData);
    const { password, ...result } = user.toObject();
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Request() req: ExpressRequest,
    @UploadedFile() file: any
  ) {
    return this.usersService.uploadAvatar(req.user.id, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('avatar')
  async deleteAvatar(@Request() req: ExpressRequest) {
    return this.usersService.deleteAvatar(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string
  ) {
    return this.usersService.findAll(page, limit, search);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    const { password, ...result } = user.toObject();
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id/role')
  async updateRole(
    @Param('id') id: string,
    @Body('role') role: string
  ) {
    return this.usersService.updateRole(id, role);
  }

  @UseGuards(JwtAuthGuard)
  @Get('settings')
  async getSettings(@Request() req: ExpressRequest) {
    return this.usersService.getSettings(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('settings')
  async updateSettings(
    @Request() req: ExpressRequest,
    @Body() settings: any
  ) {
    return this.usersService.updateSettings(req.user.id, settings);
  }
}
