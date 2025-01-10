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
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediaUsage, MediaUsageType, Media } from './types/media.types';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController implements OnModuleInit {
  private uploadDir: string;

  constructor(
    private readonly mediaService: MediaService,
    private readonly configService: ConfigService,
  ) {
    this.uploadDir = '';
  }

  async onModuleInit() {
    const uploadPath = this.configService.get<string>('UPLOAD_PATH');
    if (!uploadPath) {
      throw new Error('UPLOAD_PATH not configured');
    }
    this.uploadDir = uploadPath;

    // S'assurer que le dossier d'upload existe
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: function(req: any, file: any, callback: any) {
          const controller = req.controller as MediaController;
          if (!controller || !controller.uploadDir) {
            callback(new Error('Upload directory not configured'), '');
            return;
          }
          callback(null, controller.uploadDir);
        },
        filename: function(req: any, file: any, callback: any) {
          const uniqueSuffix = uuidv4();
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: function(req: any, file: any, callback: any) {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/svg+xml',
        ];
        if (!allowedMimes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Type de fichier non autorisé. Veuillez télécharger une image JPEG, PNG, GIF ou SVG.',
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
    // Injecter le controller dans la requête pour l'accès au uploadDir
    req.controller = this;

    if (!file) {
      throw new BadRequestException('Aucun fichier téléchargé');
    }

    if (this.uploadDir === '') {
      throw new BadRequestException('Le répertoire d\'upload n\'est pas configuré');
    }

    return this.mediaService.create(file, req.user.id);
  }

  @Post('upload-url')
  async uploadFromUrl(
    @Body() body: { url: string },
    @Request() req: any,
  ): Promise<any> {
    if (!body.url) {
      throw new BadRequestException('URL manquante');
    }
    return this.mediaService.uploadFromUrl(body.url, req.user.id);
  }

  @Get()
  async findAll(@Query('type') type?: MediaUsageType) {
    if (type === 'unused') {
      return this.mediaService.findUnused();
    }
    if (type) {
      return this.mediaService.findByUsageType(type);
    }
    return this.mediaService.findAll();
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
  addUsage(@Param('id') id: string, @Body() usageDto: UsageMediaDto) {
    return this.mediaService.addUsage(id, {
      type: usageDto.type,
      entityId: usageDto.entityId,
      entityName: usageDto.entityName,
    });
  }

  @Delete(':id/usage/:entityId')
  removeUsage(@Param('id') id: string, @Param('entityId') entityId: string) {
    return this.mediaService.removeUsage(id, entityId);
  }

  @Patch('usage/:type/:entityId')
  async updateUsageEntityName(
    @Param('type') type: MediaUsageType,
    @Param('entityId') entityId: string,
    @Body() body: { entityName: string },
  ) {
    const media = await this.mediaService.findAll({
      'usages.type': type,
      'usages.entityId': entityId,
    });

    const updatePromises = media.map((m: Media & { _id: Types.ObjectId }) => {
      const usage = m.usages.find(
        (u) => u.type === type && u.entityId === entityId,
      );
      if (usage) {
        usage.entityName = body.entityName;
        return this.mediaService.update(m._id.toString(), { usages: m.usages } as UpdateMediaDto);
      }
      return Promise.resolve();
    });

    await Promise.all(updatePromises);
    return { message: 'Usage names updated successfully' };
  }
}
