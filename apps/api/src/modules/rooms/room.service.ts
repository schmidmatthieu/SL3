import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Room, RoomDocument, RoomStatus } from './room.schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { EventsService } from '../events/events.service';
import { SpeakersService } from '../speakers/speakers.service';
import slugify from 'slugify';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @Inject(forwardRef(() => EventsService))
    private readonly eventService: EventsService,
    @Inject(forwardRef(() => SpeakersService))
    private readonly speakersService: SpeakersService,
  ) {}

  private isValidStatusTransition(
    currentStatus: RoomStatus,
    newStatus: RoomStatus,
  ): boolean {
    const validTransitions = {
      [RoomStatus.UPCOMING]: [RoomStatus.LIVE, RoomStatus.CANCELLED],
      [RoomStatus.LIVE]: [RoomStatus.PAUSED, RoomStatus.ENDED],
      [RoomStatus.PAUSED]: [RoomStatus.LIVE, RoomStatus.ENDED],
      [RoomStatus.ENDED]: [RoomStatus.UPCOMING],
      [RoomStatus.CANCELLED]: [RoomStatus.UPCOMING],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  async create(createRoomDto: CreateRoomDto, userId: string): Promise<Room> {
    let eventId = createRoomDto.eventId;
    
    if (createRoomDto.eventSlug) {
      const event = await this.eventService.findBySlug(createRoomDto.eventSlug);
      if (!event) {
        throw new NotFoundException(`Event with slug "${createRoomDto.eventSlug}" not found`);
      }
      eventId = event.id;
    }

    // Créer la room avec les données de base
    const createdRoom = new this.roomModel({
      ...createRoomDto,
      eventId,
      createdBy: userId,
      status: RoomStatus.UPCOMING,
    });

    // Le slug sera généré automatiquement par le hook pre-save
    const savedRoom = await createdRoom.save();
    
    // Ajouter la room à l'événement
    await this.eventService.addRoomToEvent(eventId, savedRoom.id);

    return savedRoom;
  }

  async findAll(eventId: string): Promise<Room[]> {

    // Si ce n'est pas un ObjectId valide, c'est peut-être un slug d'événement
    let targetEventId = eventId;
    if (!Types.ObjectId.isValid(eventId)) {
      const event = await this.eventService.findBySlug(eventId);
      if (!event) {
        throw new NotFoundException(`Event with slug "${eventId}" not found`);
      }
      targetEventId = event._id.toString();
    }

    const rooms = await this.roomModel
      .find({ eventId: targetEventId })
      .populate('eventId')
      .populate('speakers')
      .populate('moderators')
      .sort({ startTime: 1 })
      .exec();
    
    return rooms;
  }

  async findOne(idOrSlug: string): Promise<Room> {
    let room;
    if (Types.ObjectId.isValid(idOrSlug)) {
      room = await this.roomModel.findById(idOrSlug);
    } else {
      room = await this.roomModel.findOne({ slug: idOrSlug });
    }
    if (!room) {
      throw new NotFoundException(`Room with id or slug "${idOrSlug}" not found`);
    }
    return room;
  }

  async findBySlug(slug: string): Promise<Room> {
    const room = await this.roomModel.findOne({ slug }).exec();
    if (!room) {
      throw new NotFoundException(`Room with slug "${slug}" not found`);
    }
    return room;
  }

  async findByIdOrSlug(idOrSlug: string): Promise<Room> {
    return this.findOne(idOrSlug);
  }

  async findByEventId(eventId: string): Promise<Room[]> {
    return this.roomModel.find({ eventId }).exec();
  }

  async findByEventSlug(eventSlug: string): Promise<Room[]> {

    // Trouver d'abord l'événement par son slug
    const event = await this.eventService.findBySlug(eventSlug);
    if (!event) {
      throw new NotFoundException(`Event with slug "${eventSlug}" not found`);
    }

    // Utiliser l'ID de l'événement pour trouver les rooms
    const rooms = await this.roomModel
      .find({ eventId: event.id })
      .populate('eventId')
      .populate('speakers')
      .populate('moderators')
      .sort({ startTime: 1 })
      .exec();

    return rooms;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const existingRoom = await this.roomModel.findById(id);
    if (!existingRoom) {
      throw new NotFoundException(`Room ${id} not found`);
    }

    // Vérifier la transition de statut si elle est fournie
    if (updateRoomDto.status && updateRoomDto.status !== existingRoom.status) {
      if (!this.isValidStatusTransition(existingRoom.status, updateRoomDto.status)) {
        throw new BadRequestException(
          `Invalid status transition from ${existingRoom.status} to ${updateRoomDto.status}`,
        );
      }
    }

    // Si le nom est modifié, générer un nouveau slug
    if (updateRoomDto.name) {
      const newSlug = slugify(updateRoomDto.name);
      const slugExists = await this.roomModel.findOne({
        slug: newSlug,
        _id: { $ne: id },
      });
      if (slugExists) {
        const count = await this.roomModel.countDocuments({
          slug: new RegExp(`^${newSlug}(-[0-9]*)?$`),
        });
        updateRoomDto.slug = `${newSlug}-${count + 1}`;
      } else {
        updateRoomDto.slug = newSlug;
      }
    }

    // Gérer la synchronisation des speakers si ils sont modifiés
    if (updateRoomDto.speakers) {
      const currentSpeakers = existingRoom.speakers?.map(id => id.toString()) || [];
      const newSpeakers = updateRoomDto.speakers.map(id => id.toString());

      // Speakers à supprimer
      const speakersToRemove = currentSpeakers.filter(
        speaker => !newSpeakers.includes(speaker)
      );

      // Speakers à ajouter
      const speakersToAdd = newSpeakers.filter(
        speaker => !currentSpeakers.includes(speaker)
      );

      // Synchroniser les suppressions
      await Promise.all(speakersToRemove.map(speakerId =>
        this.speakersService.removeFromRoom(speakerId, id)
      ));

      // Synchroniser les ajouts
      await Promise.all(speakersToAdd.map(speakerId =>
        this.speakersService.addToRoom(speakerId, id)
      ));
    }

    // Mettre à jour la room
    const updatedRoom = await this.roomModel
      .findByIdAndUpdate(id, updateRoomDto, { new: true })
      .populate('speakers')
      .populate('moderators')
      .exec();

    return updatedRoom;
  }

  async updateStatus(id: string, newStatus: RoomStatus): Promise<Room> {
    const room = await this.findOne(id);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (!this.isValidStatusTransition(room.status, newStatus)) {
      throw new BadRequestException(
        `Cannot change status from ${room.status} to ${newStatus}`,
      );
    }

    return this.roomModel
      .findByIdAndUpdate(id, { status: newStatus }, { new: true })
      .exec();
  }

  async endRoom(id: string): Promise<Room> {
    const room = await this.findOne(id);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.status === RoomStatus.ENDED) {
      throw new BadRequestException('Room is already ended');
    }

    return this.roomModel
      .findByIdAndUpdate(id, { status: RoomStatus.ENDED }, { new: true })
      .exec();
  }

  async startStream(id: string): Promise<Room> {
    const room = await this.findOne(id);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.status === RoomStatus.LIVE) {
      throw new BadRequestException('Room is already live');
    }

    return this.roomModel
      .findByIdAndUpdate(id, { status: RoomStatus.LIVE }, { new: true })
      .exec();
  }

  async pauseStream(id: string): Promise<Room> {
    const room = await this.findOne(id);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.status !== RoomStatus.LIVE) {
      throw new BadRequestException('Room is not live');
    }

    return this.roomModel
      .findByIdAndUpdate(id, { status: RoomStatus.PAUSED }, { new: true })
      .exec();
  }

  async stopStream(id: string): Promise<Room> {
    const room = await this.findOne(id);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.status === RoomStatus.ENDED) {
      throw new BadRequestException('Room is already ended');
    }

    return this.roomModel
      .findByIdAndUpdate(id, { status: RoomStatus.ENDED }, { new: true })
      .exec();
  }

  async cancelRoom(id: string): Promise<Room> {
    const room = await this.findOne(id);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.status === RoomStatus.CANCELLED) {
      throw new BadRequestException('Room is already cancelled');
    }

    return this.roomModel
      .findByIdAndUpdate(id, { status: RoomStatus.CANCELLED }, { new: true })
      .exec();
  }

  async reactivateRoom(id: string): Promise<Room> {
    const room = await this.findOne(id);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.status === RoomStatus.UPCOMING) {
      throw new BadRequestException('Room is already active');
    }

    return this.roomModel
      .findByIdAndUpdate(id, { status: RoomStatus.UPCOMING }, { new: true })
      .exec();
  }

  async addParticipant(id: string, userId: string): Promise<Room> {
    const room = await this.roomModel
      .findByIdAndUpdate(
        id,
        { $addToSet: { participants: userId } },
        { new: true },
      )
      .exec();
    if (!room) {
      throw new NotFoundException(`Room #${id} not found`);
    }
    return room;
  }

  async removeParticipant(id: string, userId: string): Promise<Room> {
    const room = await this.roomModel
      .findByIdAndUpdate(id, { $pull: { participants: userId } }, { new: true })
      .exec();
    if (!room) {
      throw new NotFoundException(`Room #${id} not found`);
    }
    return room;
  }

  async updateStreamInfo(
    id: string,
    streamKey: string,
    streamUrl: string,
  ): Promise<Room> {
    const room = await this.roomModel
      .findByIdAndUpdate(id, { streamKey, streamUrl }, { new: true })
      .exec();
    if (!room) {
      throw new NotFoundException(`Room #${id} not found`);
    }
    return room;
  }

  async getStreamInfo(roomId: string) {
    const room = await this.roomModel.findById(roomId).exec();
    if (!room) {
      throw new NotFoundException(`Room ${roomId} not found`);
    }
    return {
      streamKey: room.streamKey,
      streamUrl: room.streamUrl,
      status: room.status,
    };
  }

  async addSpeaker(roomId: string, speakerId: string): Promise<Room> {
    const room = await this.roomModel.findById(roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (!room.speakers) {
      room.speakers = [];
    }

    const speakerObjectId = new Types.ObjectId(speakerId);
    if (!room.speakers.some(id => id.equals(speakerObjectId))) {
      room.speakers.push(speakerObjectId);
      await room.save();
      
      // Synchroniser avec le service SpeakersService
      await this.speakersService.addToRoom(speakerId, roomId);
    }

    return this.roomModel
      .findById(roomId)
      .populate('speakers')
      .populate('moderators')
      .exec();
  }

  async removeSpeaker(roomId: string, speakerId: string): Promise<Room> {
    const room = await this.roomModel.findById(roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const speakerObjectId = new Types.ObjectId(speakerId);
    const speakerIndex = room.speakers?.findIndex(id => id.equals(speakerObjectId));
    
    if (speakerIndex > -1) {
      room.speakers.splice(speakerIndex, 1);
      await room.save();
      
      // Synchroniser avec le service SpeakersService
      await this.speakersService.removeFromRoom(speakerId, roomId);
    }

    return this.roomModel
      .findById(roomId)
      .populate('speakers')
      .populate('moderators')
      .exec();
  }

  async updateSpeakers(id: string, speakers: string[]): Promise<Room> {
    const room = await this.roomModel.findById(id);
    if (!room) {
      throw new NotFoundException(`Room #${id} not found`);
    }

    // Récupérer les anciens speakers pour pouvoir les mettre à jour
    const oldSpeakers = room.speakers.map(id => id.toString());
    
    // Mettre à jour les speakers de la room
    room.speakers = speakers.map(speakerId => new Types.ObjectId(speakerId));
    const updatedRoom = await room.save();

    // Mettre à jour les références des rooms pour chaque speaker
    const removedSpeakers = oldSpeakers.filter(id => !speakers.includes(id));
    const addedSpeakers = speakers.filter(id => !oldSpeakers.includes(id));

    // Retirer la room des speakers qui ne sont plus assignés
    for (const speakerId of removedSpeakers) {
      const speaker = await this.speakersService.findOne(speakerId);
      if (speaker) {
        const updatedRooms = speaker.rooms.filter(roomId => roomId.toString() !== id);
        await this.speakersService.update(speakerId, { 
          ...speaker,
          rooms: updatedRooms.map(r => r.toString()) 
        });
      }
    }

    // Ajouter la room aux nouveaux speakers
    for (const speakerId of addedSpeakers) {
      const speaker = await this.speakersService.findOne(speakerId);
      if (speaker) {
        const updatedRooms = [...speaker.rooms, new Types.ObjectId(id)];
        await this.speakersService.update(speakerId, {
          ...speaker,
          rooms: updatedRooms.map(r => r.toString())
        });
      }
    }

    return updatedRoom;
  }

  async updateModerators(id: string, moderators: string[]): Promise<Room> {
    const room = await this.roomModel.findById(id);
    if (!room) {
      throw new NotFoundException(`Room #${id} not found`);
    }

    room.moderators = moderators.map(moderatorId => new Types.ObjectId(moderatorId));
    return await room.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.roomModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Room #${id} not found`);
    }
  }
}
