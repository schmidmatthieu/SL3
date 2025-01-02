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

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @Inject(forwardRef(() => EventsService))
    private readonly eventService: EventsService,
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
    const event = await this.eventService.findOne(createRoomDto.eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const createdRoom = new this.roomModel({
      ...createRoomDto,
      createdBy: userId,
      status: RoomStatus.UPCOMING,
    });

    const savedRoom = await createdRoom.save();

    // Convertir l'ObjectId en string pour l'ajout à l'événement
    await this.eventService.addRoomToEvent(
      createRoomDto.eventId,
      savedRoom._id.toString(),
    );

    // Retourner la salle sauvegardée
    return savedRoom;
  }

  async findAll(eventId: string): Promise<Room[]> {
    console.log('Finding rooms for event:', eventId);

    // Vérifier si l'eventId est déjà un ObjectId
    const eventIdQuery = Types.ObjectId.isValid(eventId) ? eventId : eventId;

    const rooms = await this.roomModel
      .find({ eventId: eventIdQuery })
      .populate('eventId')
      .sort({ startTime: 1 })
      .exec();

    console.log(
      'Found rooms:',
      rooms.map((r) => ({
        id: r._id,
        name: r.name,
        status: r.status,
      })),
    );
    return rooms;
  }

  async findOne(id: string): Promise<Room> {
    const room = await this.roomModel.findById(id).exec();
    if (!room) {
      throw new NotFoundException(`Room #${id} not found`);
    }
    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const room = await this.findOne(id);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    // Vérifier la transition de statut uniquement si le statut est modifié
    if (
      updateRoomDto.status &&
      !this.isValidStatusTransition(room.status, updateRoomDto.status)
    ) {
      throw new BadRequestException(
        `Invalid status transition from ${room.status} to ${updateRoomDto.status}`,
      );
    }

    // Nettoyer l'objet updateRoomDto pour ne garder que les champs définis
    const cleanedUpdate = Object.fromEntries(
      Object.entries(updateRoomDto).filter(([_, value]) => value !== undefined),
    );

    const updatedRoom = await this.roomModel
      .findByIdAndUpdate(id, { $set: cleanedUpdate }, { new: true })
      .exec();

    if (!updatedRoom) {
      throw new NotFoundException(`Room #${id} not found`);
    }
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

  async remove(id: string): Promise<void> {
    const result = await this.roomModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Room #${id} not found`);
    }
  }
}
