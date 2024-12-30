import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  async create(userId: string, createEventDto: CreateEventDto): Promise<Event> {
    this.logger.log(`Creating event for user: ${userId}`);
    this.logger.log('Event data:', createEventDto);

    const event = new this.eventModel({
      ...createEventDto,
      createdBy: userId,
    });

    const savedEvent = await event.save();
    this.logger.log('Event created:', savedEvent);
    return savedEvent;
  }

  async findAll(filters: { status?: string; date?: string } = {}): Promise<Event[]> {
    this.logger.log('Finding all events with filters:', filters);
    
    const query: any = {};
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.date) {
      query.date = new Date(filters.date);
    }

    const events = await this.eventModel.find(query).sort({ date: 1 }).exec();
    this.logger.log(`Found ${events.length} events`);
    return events;
  }

  async findOne(id: string): Promise<Event> {
    this.logger.log(`Finding event by id: ${id}`);
    
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      this.logger.error(`Event not found with id: ${id}`);
      throw new NotFoundException('Event not found');
    }

    // Convert to plain object while keeping Date objects
    const eventData = event.toObject();
    
    this.logger.log('Found event:', eventData);
    return eventData;
  }

  async findByUser(userId: string): Promise<Event[]> {
    this.logger.log(`Finding events for user: ${userId}`);
    
    const events = await this.eventModel.find({ createdBy: userId }).sort({ date: 1 }).exec();
    this.logger.log(`Found ${events.length} events for user`);
    return events;
  }

  async update(id: string, userId: string, updateEventDto: UpdateEventDto): Promise<Event> {
    this.logger.log(`Updating event ${id} for user: ${userId}`);
    this.logger.log('Update data:', updateEventDto);

    // Vérifier que la date de fin est après la date de début
    if (updateEventDto.startDateTime && updateEventDto.endDateTime) {
      const startDate = new Date(updateEventDto.startDateTime);
      const endDate = new Date(updateEventDto.endDateTime);
      
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
    }

    const event = await this.eventModel.findOneAndUpdate(
      { _id: id, createdBy: userId },
      { $set: updateEventDto },
      { new: true, runValidators: true }
    ).exec();

    if (!event) {
      this.logger.error(`Event not found or user not authorized`);
      throw new NotFoundException('Event not found or user not authorized');
    }

    this.logger.log('Event updated:', event);
    return event;
  }

  async delete(id: string, userId: string): Promise<Event> {
    this.logger.log(`Deleting event ${id} for user: ${userId}`);

    const event = await this.eventModel.findOneAndDelete({
      _id: id,
      createdBy: userId,
    }).exec();

    if (!event) {
      this.logger.error(`Event not found or user not authorized`);
      throw new NotFoundException('Event not found or user not authorized');
    }

    this.logger.log('Event deleted:', event);
    return event;
  }

  async updateStatus(id: string, status: 'live' | 'upcoming' | 'ended'): Promise<Event> {
    this.logger.log(`Updating status for event ${id} to ${status}`);

    const event = await this.eventModel.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    ).exec();

    if (!event) {
      this.logger.error(`Event not found with id: ${id}`);
      throw new NotFoundException('Event not found');
    }

    this.logger.log('Event status updated:', event);
    return event;
  }
}
