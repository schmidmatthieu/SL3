import { Injectable, NotFoundException, Logger, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event, EventDocument } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { RoomService } from '../rooms/room.service';
import { Room, RoomDocument } from '../rooms/room.schema';

interface EventWithRooms extends Omit<Event, 'rooms'> {
  rooms: Room[];
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @Inject(forwardRef(() => RoomService))
    private readonly roomService: RoomService,
  ) {}

  async create(userId: string, createEventDto: CreateEventDto): Promise<Event> {
    this.logger.log(`Creating event for user: ${userId}`);
    this.logger.log('Event data:', createEventDto);

    const event = new this.eventModel({
      ...createEventDto,
      createdBy: userId,
      rooms: [], // Initialize with empty rooms array
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

    const events = await this.eventModel.find(query)
      .sort({ startDateTime: 1 })
      .exec();
    this.logger.log(`Found ${events.length} events`);
    return events;
  }

  async findOne(id: string): Promise<EventResponseDto> {
    this.logger.log('Finding event by id: ' + id);
    
    // Obtenir l'événement avec ses références aux salles
    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Obtenir les détails des salles depuis RoomService
    const rooms = await this.roomService.findAll(id);
    this.logger.log('Found rooms:', rooms);

    // Convertir l'événement en DTO de réponse
    const response: EventResponseDto = {
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      imageUrl: event.imageUrl,
      status: event.status,
      rooms: rooms,
      createdBy: event.createdBy.toString(),
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
    };

    this.logger.log('Found event:', response);
    return response;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    this.logger.log(`Updating event with id: ${id}`);
    this.logger.log('Update data:', updateEventDto);

    const event = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .exec();
    if (!event) {
      this.logger.error(`Event not found with id: ${id}`);
      throw new NotFoundException(`Event #${id} not found`);
    }
    this.logger.log('Updated event:', event);
    return event;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing event with id: ${id}`);

    const event = await this.eventModel.findByIdAndDelete(id).exec();
    if (!event) {
      this.logger.error(`Event not found with id: ${id}`);
      throw new NotFoundException(`Event #${id} not found`);
    }
    this.logger.log('Event removed successfully');
  }

  async addRoomToEvent(eventId: string, roomId: string): Promise<EventResponseDto> {
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // Vérifier si la salle n'est pas déjà dans l'événement
    if (!event.rooms.includes(roomId)) {
      event.rooms.push(roomId);
      await event.save();
    }

    // Retourner l'événement mis à jour avec les détails des salles
    return this.findOne(eventId);
  }

  async removeRoom(eventId: string, roomId: string): Promise<EventResponseDto> {
    this.logger.log(`Removing room ${roomId} from event ${eventId}`);

    const event = await this.eventModel
      .findByIdAndUpdate(
        eventId,
        { $pull: { rooms: roomId } },
        { new: true }
      )
      .exec();

    if (!event) {
      this.logger.error(`Event not found with id: ${eventId}`);
      throw new NotFoundException(`Event #${eventId} not found`);
    }

    this.logger.log('Room removed from event:', event);
    return this.findOne(eventId);
  }

  async findByUser(userId: string): Promise<Event[]> {
    this.logger.log(`Finding events for user: ${userId}`);
    
    const events = await this.eventModel.find({ createdBy: userId })
      .sort({ date: 1 })
      .exec();
    this.logger.log(`Found ${events.length} events for user`);
    return events;
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
