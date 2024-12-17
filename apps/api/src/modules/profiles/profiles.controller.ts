import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfilesService } from './profiles.service';
import { FilesService } from '../files/files.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './schemas/profile.schema';

@Controller('api/profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  private readonly logger = new Logger(ProfilesController.name);

  constructor(
    private readonly profilesService: ProfilesService,
    private readonly filesService: FilesService,
  ) {}

  @Get('me')
  async getMyProfile(@Request() req): Promise<Profile> {
    this.logger.log(`Getting profile for user: ${req.user.id}`);
    const profile = await this.profilesService.findByUserId(req.user.id);
    this.logger.log(`Retrieved profile:`, profile);
    return profile;
  }

  @Put('me')
  async updateMyProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    this.logger.log(`Updating profile for user: ${req.user.id}`);
    this.logger.log('Update data:', updateProfileDto);
    
    try {
      // Vérifier que l'utilisateur existe
      const existingProfile = await this.profilesService.findByUserId(req.user.id);
      this.logger.log('Existing profile:', existingProfile);

      // Mettre à jour le profil
      const profile = await this.profilesService.update(req.user.id, updateProfileDto);
      this.logger.log('Profile updated successfully:', profile);
      return profile;
    } catch (error) {
      this.logger.error('Error updating profile:', error);
      throw error;
    }
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Profile> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    try {
      const avatarUrl = await this.filesService.uploadFile(file, req.user.id, 'avatar');
      this.logger.log('Avatar uploaded:', avatarUrl);

      // Supprimer l'ancien avatar si nécessaire
      const currentProfile = await this.profilesService.findByUserId(req.user.id);
      if (currentProfile?.avatarUrl) {
        await this.filesService.deleteFile(currentProfile.avatarUrl);
      }

      const profile = await this.profilesService.update(req.user.id, { avatarUrl });
      this.logger.log('Profile updated with new avatar:', profile);
      return profile;
    } catch (error) {
      this.logger.error('Error uploading avatar:', error);
      throw error;
    }
  }
}
