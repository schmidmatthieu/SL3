import {
  Injectable,
  NotFoundException,
  Logger,
  forwardRef,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Query, Document } from 'mongoose';
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

  async findAll(
    filters: { status?: string; date?: string } = {},
  ): Promise<any[]> {
    this.logger.log('Finding all events with filters:', filters);

    // Construire la requête
    const query = this.eventModel.find();

    if (filters.status) {
      query.where('status', filters.status);
    }
    if (filters.date) {
      query.where('date', new Date(filters.date));
    }

    // Récupérer les événements
    const events = await query.sort({ startDateTime: 1 }).lean().exec();

    // Pour chaque événement dans le tableau
    for (let i = 0; i < events.length; i++) {
      const event = events[i] as any;

      // Récupérer toutes les rooms qui existent réellement
      const existingRooms = await this.roomService.findAll(
        event._id.toString(),
      );

      // S'assurer que event.rooms existe
      if (!event.rooms) {
        event.rooms = [];
      }

      // Mettre à jour l'événement avec les rooms complètes
      if (existingRooms.length !== event.rooms.length) {
        this.logger.warn(
          `Event ${event._id} has ${event.rooms.length} room references but found ${existingRooms.length} rooms`,
        );

        // Mettre à jour dans la base de données
        await this.eventModel.findByIdAndUpdate(event._id, {
          $set: { rooms: existingRooms },
        });

        // Mettre à jour l'objet local
        event.rooms = existingRooms;
      }
    }

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
      featured: event.featured,
      rooms: rooms,
      createdBy: event.createdBy.toString(),
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };

    this.logger.log('Found event:', response);
    return response;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    this.logger.log('Updating event:', { id, updateEventDto });

    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }

    // Validate dates if they are provided
    if (updateEventDto.startDateTime && updateEventDto.endDateTime) {
      const startDate = new Date(updateEventDto.startDateTime);
      const endDate = new Date(updateEventDto.endDateTime);

      this.logger.log('Validating dates:', { startDate, endDate });

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }

      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .exec();

    this.logger.log('Event updated:', updatedEvent);
    return updatedEvent;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing event with id: ${id}`);

    // Récupérer l'événement pour avoir la liste des salles
    const event = await this.eventModel.findById(id);
    if (!event) {
      this.logger.error(`Event not found with id: ${id}`);
      throw new NotFoundException(`Event #${id} not found`);
    }

    // Supprimer toutes les salles associées
    for (const roomId of event.rooms) {
      try {
        await this.roomService.remove(roomId.toString());
        this.logger.log(`Room ${roomId} removed successfully`);
      } catch (error) {
        this.logger.error(`Error removing room ${roomId}:`, error);
      }
    }

    // Supprimer l'événement
    await event.deleteOne();
    this.logger.log('Event and associated rooms removed successfully');
  }

  async addRoomToEvent(
    eventId: string,
    roomId: string,
  ): Promise<EventResponseDto> {
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
      .findByIdAndUpdate(eventId, { $pull: { rooms: roomId } }, { new: true })
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

    const events = await this.eventModel
      .find({ createdBy: userId })
      .sort({ date: 1 })
      .exec();
    this.logger.log(`Found ${events.length} events for user`);
    return events;
  }

  async updateStatus(
    id: string,
    status: 'live' | 'upcoming' | 'ended',
  ): Promise<Event> {
    this.logger.log(`Updating status for event ${id} to ${status}`);

    const event = await this.eventModel
      .findByIdAndUpdate(
        id,
        { $set: { status } },
        { new: true, runValidators: true },
      )
      .exec();

    if (!event) {
      this.logger.error(`Event not found with id: ${id}`);
      throw new NotFoundException('Event not found');
    }

    this.logger.log('Event status updated:', event);
    return event;
  }
}
