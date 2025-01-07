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
    this.logger.log('Creating event:', createEventDto);

    const { startDateTime, endDateTime, title } = createEventDto;

    if (startDateTime && endDateTime) {
      const startDate = new Date(startDateTime);
      const endDate = new Date(endDateTime);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }

      if (startDate >= endDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    // Générer le slug à partir du titre
    const baseSlug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    let slug = baseSlug;
    let counter = 1;

    // Vérifier si le slug existe déjà
    while (await this.eventModel.findOne({ slug }).exec()) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const event = await this.eventModel.create({
      ...createEventDto,
      slug,
      createdBy: userId,
      rooms: [],
    });

    this.logger.log('Event created with slug:', event.slug);
    return event;
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
      const date = new Date(filters.date);
      if (isNaN(date.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
      query.where('date', date);
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

    // Convertir les événements en DTOs de réponse
    return events.map(event => ({
      id: event._id.toString(),
      title: event.title,
      slug: event.slug,
      description: event.description,
      startDateTime: event.startDateTime.toISOString(),
      endDateTime: event.endDateTime.toISOString(),
      imageUrl: event.imageUrl,
      status: event.status,
      featured: event.featured,
      rooms: event.rooms?.map(room => room.toString()) || [],
      createdBy: event.createdBy?.toString() || '',
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }));
  }

  async findOne(id: string): Promise<EventResponseDto> {
    this.logger.log('Finding event by id: ' + id);

    // Obtenir l'événement avec ses références aux salles
    const event = await this.eventModel.findById(id).exec();

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
      slug: event.slug,
      description: event.description,
      startDateTime: event.startDateTime.toISOString(),
      endDateTime: event.endDateTime.toISOString(),
      imageUrl: event.imageUrl,
      status: event.status,
      featured: event.featured,
      rooms: rooms.map(room => room.toString()),
      createdBy: event.createdBy?.toString() || '', // Valeur par défaut pour les tests
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };

    this.logger.log('Found event:', response);
    return response;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    this.logger.log('Updating event:', { id, updateEventDto });

    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    this.logger.log('Current event state:', event);

    // Validate dates if they are provided
    const { startDateTime, endDateTime } = updateEventDto;
    if (startDateTime && endDateTime) {
      const startDate = new Date(startDateTime);
      const endDate = new Date(endDateTime);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }

      if (startDate >= endDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    this.logger.log('UpdateEventDto before assign:', updateEventDto);
    Object.assign(event, updateEventDto);
    this.logger.log('Event after assign:', event);

    const updatedEvent = await event.save();
    this.logger.log('Event after save:', updatedEvent);
    
    return updatedEvent;
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing event with id: ${id}`);

    // Récupérer l'événement pour avoir la liste des salles
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      this.logger.error(`Event not found with id: ${id}`);
      throw new NotFoundException('Event not found');
    }

    // Supprimer toutes les salles associées
    if (event.rooms && Array.isArray(event.rooms)) {
      for (const roomId of event.rooms) {
        try {
          await this.roomService.remove(roomId.toString());
          this.logger.log(`Room ${roomId} removed successfully`);
        } catch (error) {
          this.logger.error(`Error removing room ${roomId}:`, error);
        }
      }
    }

    await event.deleteOne();
    this.logger.log('Event and associated rooms removed successfully');
  }

  async addRoomToEvent(
    eventId: string,
    roomId: string,
  ): Promise<EventResponseDto> {
    const event = await this.eventModel.findById(eventId).exec();
    if (!event) {
      throw new NotFoundException('Event not found');
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
      throw new NotFoundException('Event not found');
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

  async findBySlug(slug: string): Promise<Event> {
    const event = await this.eventModel.findOne({ slug }).exec();
    if (!event) {
      throw new NotFoundException(`Event with slug "${slug}" not found`);
    }
    return event;
  }

  async findByIdOrSlug(idOrSlug: string): Promise<Event> {
    let event;
    
    this.logger.log(`Finding event by ID or slug: ${idOrSlug}`);

    if (Types.ObjectId.isValid(idOrSlug)) {
      event = await this.eventModel.findById(idOrSlug).exec();
      this.logger.log(`Searched by ID, found:`, event);
    }

    if (!event) {
      event = await this.eventModel.findOne({ slug: idOrSlug }).exec();
      this.logger.log(`Searched by slug, found:`, event);
    }

    if (!event) {
      this.logger.error(`Event not found with ID or slug: ${idOrSlug}`);
      throw new NotFoundException(`Event not found`);
    }

    // S'assurer que l'événement a un slug
    if (!event.slug) {
      event.slug = event.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      await event.save();
      this.logger.log(`Generated and saved slug for event: ${event.slug}`);
    }

    // Récupérer les rooms associées en utilisant l'ID de l'événement
    const rooms = await this.roomService.findAll(event._id.toString());
    
    // Retourner l'événement avec ses rooms
    return {
      ...event.toObject(),
      id: event._id,  // S'assurer que l'ID est toujours présent
      rooms
    };
  }
}
