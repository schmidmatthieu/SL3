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
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('events')
@ApiBearerAuth()
@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event successfully created', type: EventResponseDto })
  create(@Request() req, @Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(req.user.id, createEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events' })
  @ApiResponse({ status: 200, description: 'Return all events', type: [EventResponseDto] })
  findAll(@Query() query: { status?: string; date?: string }) {
    return this.eventsService.findAll(query);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my events' })
  @ApiResponse({ status: 200, description: 'Return user events', type: [EventResponseDto] })
  findMyEvents(@Request() req) {
    return this.eventsService.findByUser(req.user.id);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get event by ID or slug' })
  @ApiResponse({ status: 200, description: 'Return the event', type: EventResponseDto })
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.eventsService.findByIdOrSlug(idOrSlug);
  }

  @Patch(':idOrSlug')
  @ApiOperation({ summary: 'Update an event' })
  @ApiResponse({ status: 200, description: 'Event successfully updated', type: EventResponseDto })
  async update(
    @Param('idOrSlug') idOrSlug: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    this.logger.log('Updating event:', { idOrSlug, updateEventDto });
    
    try {
      const event = await this.eventsService.findByIdOrSlug(idOrSlug);
      
      // Si les données sont envoyées en JSON dans un champ 'data'
      if (updateEventDto.data) {
        try {
          const jsonData = JSON.parse(updateEventDto.data);
          return this.eventsService.update(event.id, jsonData);
        } catch (error) {
          this.logger.error('Error parsing JSON data:', error);
          throw new BadRequestException('Invalid JSON data');
        }
      }
      
      // Sinon, utiliser directement le DTO
      return this.eventsService.update(event.id, updateEventDto);
    } catch (error) {
      this.logger.error('Error updating event:', error);
      throw error;
    }
  }

  @Delete(':idOrSlug')
  @ApiOperation({ summary: 'Delete an event' })
  @ApiResponse({ status: 204, description: 'Event successfully deleted' })
  async remove(@Param('idOrSlug') idOrSlug: string) {
    const event = await this.eventsService.findByIdOrSlug(idOrSlug);
    return this.eventsService.remove(event.id);
  }

  @Post(':id/rooms/:roomId')
  @ApiOperation({ summary: 'Add a room to an event' })
  @ApiResponse({ status: 201, description: 'Room successfully added' })
  addRoom(@Param('id') id: string, @Param('roomId') roomId: string) {
    this.logger.log(`Adding room ${roomId} to event ${id}`);
    return this.eventsService.addRoomToEvent(id, roomId);
  }

  @Delete(':id/rooms/:roomId')
  @ApiOperation({ summary: 'Remove a room from an event' })
  @ApiResponse({ status: 204, description: 'Room successfully removed' })
  removeRoom(@Param('id') id: string, @Param('roomId') roomId: string) {
    this.logger.log(`Removing room ${roomId} from event ${id}`);
    return this.eventsService.removeRoom(id, roomId);
  }
}
