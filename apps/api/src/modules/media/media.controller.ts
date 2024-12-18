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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { UpdateMediaDto } from './dto/update-media.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const storage = diskStorage({
  destination: './public/uploads',
  filename: (req, file, callback) => {
    const uniqueSuffix = uuidv4();
    callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('api/media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage,
    fileFilter: (req, file, callback) => {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
      if (!allowedMimes.includes(file.mimetype)) {
        return callback(new Error('File type not allowed. Please upload a JPEG, PNG, GIF, or SVG image.'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB
    },
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    console.log('Received file:', file); 
    return this.mediaService.create(file, req.user.id);
  }

  @Get()
  findAll() {
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
}
