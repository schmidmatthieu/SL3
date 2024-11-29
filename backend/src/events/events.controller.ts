import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request as ExpressRequest } from 'express';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: ExpressRequest, @Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(req.user.id, createEventDto);
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('location') location?: string
  ) {
    return this.eventsService.findAll({
      page,
      limit,
      search,
      category,
      startDate,
      endDate,
      location
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Request() req: ExpressRequest,
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto
  ) {
    return this.eventsService.update(req.user.id, id, updateEventDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Request() req: ExpressRequest, @Param('id') id: string) {
    return this.eventsService.remove(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Request() req: ExpressRequest,
    @Param('id') id: string,
    @UploadedFile() file: any
  ) {
    return this.eventsService.uploadImage(req.user.id, id, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/image')
  async deleteImage(@Request() req: ExpressRequest, @Param('id') id: string) {
    return this.eventsService.deleteImage(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/register')
  async registerForEvent(@Request() req: ExpressRequest, @Param('id') id: string) {
    return this.eventsService.registerForEvent(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/register')
  async unregisterFromEvent(@Request() req: ExpressRequest, @Param('id') id: string) {
    return this.eventsService.unregisterFromEvent(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/registered')
  async getUserRegisteredEvents(@Request() req: ExpressRequest) {
    return this.eventsService.getUserRegisteredEvents(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/created')
  async getUserCreatedEvents(@Request() req: ExpressRequest) {
    return this.eventsService.getUserCreatedEvents(req.user.id);
  }
}
