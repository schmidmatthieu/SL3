import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  Query,
  OnModuleInit,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { UsageMediaDto } from './dto/usage-media.dto';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediaUsage, MediaUsageType } from './types/media.types';
import * as fs from 'fs';

const UPLOAD_DIR = './public/uploads';

// S'assurer que le dossier d'upload existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, callback) => {
    const uniqueSuffix = uuidv4();
    callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter: (req, file, callback) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/svg+xml',
        ];
        if (!allowedMimes.includes(file.mimetype)) {
          return callback(
            new Error(
              'File type not allowed. Please upload a JPEG, PNG, GIF, or SVG image.',
            ),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    console.log('Received file:', file);
    return this.mediaService.create(file, req.user.id);
  }

  @Post('upload-url')
  async uploadFromUrl(
    @Body() body: { url: string },
    @Request() req: any,
  ): Promise<any> {
    return this.mediaService.uploadFromUrl(body.url, req.user.id);
  }

  @Get()
  async findAll(@Query('type') type?: MediaUsageType) {
    switch (type) {
      case 'unused':
        return this.mediaService.findUnused();
      case 'profile':
      case 'speaker':
      case 'event':
      case 'room':
      case 'logo':
        return this.mediaService.findByUsageType(type);
      default:
        return this.mediaService.findAll();
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMediaDto: UpdateMediaDto) {
    return this.mediaService.update(id, updateMediaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }

  @Post(':id/usage')
  async addUsage(@Param('id') id: string, @Body() usage: UsageMediaDto) {
    return this.mediaService.addUsage(id, usage);
  }

  @Delete(':id/usage/:entityId')
  async removeUsage(
    @Param('id') id: string,
    @Param('entityId') entityId: string,
  ) {
    return this.mediaService.removeUsage(id, entityId);
  }

  @Patch('usage/:type/:entityId')
  async updateUsageEntityName(
    @Param('type') type: MediaUsage['type'],
    @Param('entityId') entityId: string,
    @Body('entityName') entityName: string,
  ) {
    return this.mediaService.updateUsageEntityName(type, entityId, entityName);
  }
}
