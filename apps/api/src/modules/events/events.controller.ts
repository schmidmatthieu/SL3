import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  Logger,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  private readonly logger = new Logger(EventsController.name);
  
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Request() req, @Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(req.user.id, createEventDto);
  }

  @Get()
  findAll(@Query('status') status?: string, @Query('date') date?: string) {
    return this.eventsService.findAll({ status, date });
  }

  @Get('my')
  findMyEvents(@Request() req) {
    return this.eventsService.findByUser(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<EventResponseDto> {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Post(':id/rooms/:roomId')
  addRoom(@Param('id') id: string, @Param('roomId') roomId: string) {
    this.logger.log(`Adding room ${roomId} to event ${id}`);
    return this.eventsService.addRoomToEvent(id, roomId);
  }

  @Delete(':id/rooms/:roomId')
  removeRoom(@Param('id') id: string, @Param('roomId') roomId: string) {
    this.logger.log(`Removing room ${roomId} from event ${id}`);
    return this.eventsService.removeRoom(id, roomId);
  }
}
