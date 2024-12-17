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
  Request,
  Logger,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Event } from './schemas/event.schema';

@Controller('api/events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async create(@Request() req, @Body() createEventDto: CreateEventDto): Promise<Event> {
    this.logger.log(`Creating event for user: ${req.user.id}`);
    return this.eventsService.create(req.user.id, createEventDto);
  }

  @Get()
  async findAll(@Query('status') status?: string, @Query('date') date?: string): Promise<Event[]> {
    this.logger.log('Finding all events');
    return this.eventsService.findAll({ status, date });
  }

  @Get('me')
  async findMyEvents(@Request() req): Promise<Event[]> {
    this.logger.log(`Finding events for user: ${req.user.id}`);
    return this.eventsService.findByUser(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Event | { message: string }> {
    // Skip if trying to access manage route
    if (id === 'manage') {
      return { message: 'Manage route' };
    }
    this.logger.log(`Finding event by id: ${id}`);
    return this.eventsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    this.logger.log(`Updating event ${id} for user: ${req.user.id}`);
    return this.eventsService.update(id, req.user.id, updateEventDto);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'live' | 'upcoming' | 'ended',
  ): Promise<Event> {
    this.logger.log(`Updating status for event ${id} to ${status}`);
    return this.eventsService.updateStatus(id, status);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string): Promise<Event> {
    this.logger.log(`Deleting event ${id} for user: ${req.user.id}`);
    return this.eventsService.delete(id, req.user.id);
  }
}
