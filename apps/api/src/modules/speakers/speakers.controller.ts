import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { SpeakersService } from './speakers.service';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateSpeakerDto } from './dto/update-speaker.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Speaker } from './schemas/speaker.schema';
import { ConfigService } from '@nestjs/config';

@Controller('events/:eventId/speakers')
@UseGuards(JwtAuthGuard)
export class SpeakersController {
  private readonly logger = new Logger(SpeakersController.name);

  constructor(
    private readonly speakersService: SpeakersService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  async create(
    @Param('eventId') eventId: string,
    @Body() createSpeakerDto: CreateSpeakerDto,
  ): Promise<Speaker> {
    this.logger.log(`Creating speaker for event: ${eventId}`);
    return this.speakersService.create({ ...createSpeakerDto, eventId });
  }

  @Get()
  async findAll(@Param('eventId') eventId: string): Promise<Speaker[]> {
    this.logger.log(`Finding all speakers for event: ${eventId}`);
    return this.speakersService.findAll(eventId);
  }

  @Get(':id')
  async findOne(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
  ): Promise<Speaker> {
    this.logger.log(`Finding speaker by id: ${id} for event: ${eventId}`);
    return this.speakersService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @Body() updateSpeakerDto: UpdateSpeakerDto,
  ): Promise<Speaker> {
    this.logger.log(`Updating speaker ${id} for event: ${eventId}`);
    return this.speakersService.update(id, updateSpeakerDto);
  }

  @Delete(':id')
  async remove(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
  ): Promise<Speaker> {
    this.logger.log(`Removing speaker ${id} from event: ${eventId}`);
    return this.speakersService.remove(id);
  }

  @Get('room/:roomId')
  async findByRoom(
    @Param('eventId') eventId: string,
    @Param('roomId') roomId: string,
  ): Promise<Speaker[]> {
    this.logger.log(
      `Finding speakers for room: ${roomId} in event: ${eventId}`,
    );
    return this.speakersService.findByRoom(roomId);
  }

  @Post(':id/image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif)$/)) {
          callback(new Error('Only image files are allowed!'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async uploadImage(
    @Param('eventId') eventId: string,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Speaker> {
    this.logger.log(`Uploading image for speaker ${id} in event ${eventId}`);
    const baseUrl = this.configService.get('API_URL') || 'http://localhost:3001';
    const imageUrl = `${baseUrl}/uploads/${file.filename}`;
    return this.speakersService.updateImage(id, imageUrl);
  }
}
