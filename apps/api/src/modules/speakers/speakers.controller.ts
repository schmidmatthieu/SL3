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
} from '@nestjs/common';
import { SpeakersService } from './speakers.service';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateSpeakerDto } from './dto/update-speaker.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Speaker } from './schemas/speaker.schema';

@Controller('events/:eventId/speakers')
@UseGuards(JwtAuthGuard)
export class SpeakersController {
  private readonly logger = new Logger(SpeakersController.name);

  constructor(private readonly speakersService: SpeakersService) {}

  @Post()
  async create(
    @Param('eventId') eventId: string,
    @Body() createSpeakerDto: CreateSpeakerDto
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
    @Param('id') id: string
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
    @Param('id') id: string
  ): Promise<Speaker> {
    this.logger.log(`Removing speaker ${id} from event: ${eventId}`);
    return this.speakersService.remove(id);
  }

  @Get('room/:roomId')
  async findByRoom(
    @Param('eventId') eventId: string,
    @Param('roomId') roomId: string
  ): Promise<Speaker[]> {
    this.logger.log(`Finding speakers for room: ${roomId} in event: ${eventId}`);
    return this.speakersService.findByRoom(roomId);
  }
}
