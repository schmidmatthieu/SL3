import { Injectable, NotFoundException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Speaker, SpeakerDocument } from './schemas/speaker.schema';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateSpeakerDto } from './dto/update-speaker.dto';
import { MediaService } from '../media/media.service';
import { RoomService } from '../rooms/room.service';
import { EventsService } from '../events/events.service';

@Injectable()
export class SpeakersService {
  private readonly logger = new Logger(SpeakersService.name);

  constructor(
    @InjectModel(Speaker.name) private speakerModel: Model<SpeakerDocument>,
    private readonly mediaService: MediaService,
    @Inject(forwardRef(() => RoomService))
    private readonly roomService: RoomService,
    @Inject(forwardRef(() => EventsService))
    private readonly eventService: EventsService,
  ) {}

  async create(createSpeakerDto: CreateSpeakerDto): Promise<Speaker> {
    this.logger.log(`Creating speaker for event: ${createSpeakerDto.eventId}`);

    const speaker = new this.speakerModel(createSpeakerDto);
    const savedSpeaker = await speaker.save();

    // Ajouter l'utilisation de l'image si elle existe
    if (createSpeakerDto.imageUrl) {
      const filename = createSpeakerDto.imageUrl.split('/').pop();
      if (filename) {
        const media = await this.mediaService.findByFilename(filename);
        if (media) {
          await this.mediaService.addUsage(media._id.toString(), {
            type: 'speaker',
            entityId: savedSpeaker._id.toString(),
            entityName: `${savedSpeaker.firstName} ${savedSpeaker.lastName}`,
          });
        }
      }
    }

    this.logger.log('Speaker created:', savedSpeaker);
    return savedSpeaker;
  }

  async findAll(eventIdOrSlug?: string): Promise<Speaker[]> {
    this.logger.log(
      `Finding all speakers${eventIdOrSlug ? ` for event: ${eventIdOrSlug}` : ''}`,
    );

    let eventId = eventIdOrSlug;

    if (eventIdOrSlug && !Types.ObjectId.isValid(eventIdOrSlug)) {
      // Si ce n'est pas un ID valide, c'est peut-être un slug
      const event = await this.eventService.findBySlug(eventIdOrSlug);
      if (!event) {
        throw new NotFoundException(`Event with slug "${eventIdOrSlug}" not found`);
      }
      eventId = event._id.toString();
    }

    const query = eventId ? { eventId } : {};
    const speakers = await this.speakerModel
      .find(query)
      .sort({ lastName: 1 })
      .exec();

    this.logger.log(`Found ${speakers.length} speakers`);
    return speakers;
  }

  async findOne(id: string): Promise<Speaker> {
    this.logger.log(`Finding speaker by id: ${id}`);

    const speaker = await this.speakerModel.findById(id).exec();
    if (!speaker) {
      this.logger.error(`Speaker not found with id: ${id}`);
      throw new NotFoundException('Speaker not found');
    }

    return speaker;
  }

  async update(
    id: string,
    updateSpeakerDto: UpdateSpeakerDto,
  ): Promise<Speaker> {
    this.logger.log(`Updating speaker ${id}`);

    const speaker = await this.speakerModel.findById(id);
    if (!speaker) {
      throw new NotFoundException('Speaker not found');
    }

    // Si l'image est modifiée, mettre à jour les utilisations
    if (
      updateSpeakerDto.imageUrl &&
      updateSpeakerDto.imageUrl !== speaker.imageUrl
    ) {
      // Supprimer l'ancienne utilisation si elle existe
      if (speaker.imageUrl) {
        const oldFilename = speaker.imageUrl.split('/').pop();
        if (oldFilename) {
          const oldMedia = await this.mediaService.findByFilename(oldFilename);
          if (oldMedia) {
            await this.mediaService.removeUsage(oldMedia._id.toString(), id);
          }
        }
      }

      // Ajouter la nouvelle utilisation
      const newFilename = updateSpeakerDto.imageUrl.split('/').pop();
      if (newFilename) {
        const newMedia = await this.mediaService.findByFilename(newFilename);
        if (newMedia) {
          await this.mediaService.addUsage(newMedia._id.toString(), {
            type: 'speaker',
            entityId: id,
            entityName: `${speaker.firstName} ${speaker.lastName}`,
          });
        }
      }
    }

    // Gérer la synchronisation des rooms si elles sont modifiées
    if (updateSpeakerDto.rooms) {
      const currentRooms = speaker.rooms || [];
      const newRooms = updateSpeakerDto.rooms;

      // Rooms à supprimer
      const roomsToRemove = currentRooms.filter(room => !newRooms.includes(room));
      // Rooms à ajouter
      const roomsToAdd = newRooms.filter(room => !currentRooms.includes(room));

      // Synchroniser les suppressions
      await Promise.all(roomsToRemove.map(roomId => 
        this.roomService.removeSpeaker(roomId, id)
      ));

      // Synchroniser les ajouts
      await Promise.all(roomsToAdd.map(roomId =>
        this.roomService.addSpeaker(roomId, id)
      ));
    }

    const updatedSpeaker = await this.speakerModel
      .findByIdAndUpdate(id, updateSpeakerDto, { new: true })
      .exec();

    this.logger.log('Speaker updated successfully');
    return updatedSpeaker;
  }

  async addToRoom(speakerId: string, roomId: string): Promise<Speaker> {
    this.logger.log(`Adding speaker ${speakerId} to room ${roomId}`);

    const speaker = await this.speakerModel.findById(speakerId);
    if (!speaker) {
      throw new NotFoundException('Speaker not found');
    }

    if (!speaker.rooms) {
      speaker.rooms = [];
    }

    if (!speaker.rooms.includes(roomId)) {
      speaker.rooms.push(roomId);
      await speaker.save();
      
      // Synchroniser avec le RoomService
      await this.roomService.addSpeaker(roomId, speakerId);
    }

    return speaker;
  }

  async removeFromRoom(speakerId: string, roomId: string): Promise<Speaker> {
    this.logger.log(`Removing speaker ${speakerId} from room ${roomId}`);

    const speaker = await this.speakerModel.findById(speakerId);
    if (!speaker) {
      throw new NotFoundException('Speaker not found');
    }

    if (speaker.rooms) {
      speaker.rooms = speaker.rooms.filter(id => id !== roomId);
      await speaker.save();
      
      // Synchroniser avec le RoomService
      await this.roomService.removeSpeaker(roomId, speakerId);
    }

    return speaker;
  }

  async remove(id: string): Promise<Speaker> {
    this.logger.log(`Removing speaker ${id}`);

    const speaker = await this.speakerModel.findById(id);
    if (!speaker) {
      this.logger.error(`Speaker not found with id: ${id}`);
      throw new NotFoundException('Speaker not found');
    }

    // Retirer le speaker de toutes les rooms associées
    const rooms = speaker.rooms || [];
    for (const roomId of rooms) {
      const room = await this.roomService.findOne(roomId.toString());
      if (room) {
        const updatedSpeakers = room.speakers.filter(speakerId => speakerId.toString() !== id);
        await this.roomService.updateSpeakers(roomId.toString(), updatedSpeakers.map(id => id.toString()));
      }
    }

    const deletedSpeaker = await this.speakerModel.findByIdAndDelete(id).exec();
    if (!deletedSpeaker) {
      this.logger.error(`Speaker not found with id: ${id}`);
      throw new NotFoundException('Speaker not found');
    }

    this.logger.log('Speaker removed:', deletedSpeaker);
    return deletedSpeaker;
  }

  async findByEvent(eventIdOrSlug: string): Promise<Speaker[]> {
    this.logger.log(`Finding speakers for event: ${eventIdOrSlug}`);

    let eventId = eventIdOrSlug;

    if (eventIdOrSlug && !Types.ObjectId.isValid(eventIdOrSlug)) {
      // Si ce n'est pas un ID valide, c'est peut-être un slug
      const event = await this.eventService.findBySlug(eventIdOrSlug);
      if (!event) {
        throw new NotFoundException(`Event with slug "${eventIdOrSlug}" not found`);
      }
      eventId = event._id.toString();
    }

    const speakers = await this.speakerModel
      .find({ eventId })
      .sort({ lastName: 1 })
      .exec();
    this.logger.log(`Found ${speakers.length} speakers for event`);

    return speakers;
  }

  async findByRoom(roomId: string): Promise<Speaker[]> {
    this.logger.log(`Finding speakers for room: ${roomId}`);

    const speakers = await this.speakerModel
      .find({ rooms: roomId })
      .sort({ lastName: 1 })
      .exec();
    this.logger.log(`Found ${speakers.length} speakers for room`);

    return speakers;
  }

  async uploadImage(id: string, file: Express.Multer.File): Promise<string> {
    this.logger.log(`Uploading image for speaker ${id}`);

    const speaker = await this.speakerModel.findById(id);
    if (!speaker) {
      throw new NotFoundException('Speaker not found');
    }

    // Créer l'entrée média avec le fichier uploadé
    const media = await this.mediaService.create(file, speaker._id.toString());

    // Ajouter l'utilisation du média
    await this.mediaService.addUsage((media as any)._id.toString(), {
      type: 'speaker',
      entityId: speaker._id.toString(),
      entityName: `${speaker.firstName} ${speaker.lastName}`,
    });

    // Mettre à jour l'URL de l'image du speaker
    const imageUrl = media.url;
    await this.speakerModel.findByIdAndUpdate(id, { imageUrl });

    return imageUrl;
  }

  async updateImage(id: string, imageUrl: string): Promise<Speaker> {
    this.logger.log(`Updating image for speaker ${id}`);
    
    const speaker = await this.speakerModel.findById(id);
    if (!speaker) {
      throw new NotFoundException('Speaker not found');
    }

    // Supprimer l'ancienne utilisation si elle existe
    if (speaker.imageUrl) {
      const oldFilename = speaker.imageUrl.split('/').pop();
      if (oldFilename) {
        const oldMedia = await this.mediaService.findByFilename(oldFilename);
        if (oldMedia) {
          await this.mediaService.removeUsage(oldMedia._id.toString(), id);
        }
      }
    }

    // Ajouter la nouvelle utilisation
    const newFilename = imageUrl.split('/').pop();
    if (newFilename) {
      const newMedia = await this.mediaService.findByFilename(newFilename);
      if (newMedia) {
        await this.mediaService.addUsage(newMedia._id.toString(), {
          type: 'speaker',
          entityId: id,
          entityName: `${speaker.firstName} ${speaker.lastName}`,
        });
      }
    }

    const updatedSpeaker = await this.speakerModel
      .findByIdAndUpdate(id, { imageUrl }, { new: true })
      .exec();

    this.logger.log('Speaker image updated:', updatedSpeaker);
    return updatedSpeaker;
  }
}
