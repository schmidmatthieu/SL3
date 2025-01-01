import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Speaker, SpeakerDocument } from './schemas/speaker.schema';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateSpeakerDto } from './dto/update-speaker.dto';
import { MediaService } from '../media/media.service';

@Injectable()
export class SpeakersService {
  private readonly logger = new Logger(SpeakersService.name);

  constructor(
    @InjectModel(Speaker.name) private speakerModel: Model<SpeakerDocument>,
    private readonly mediaService: MediaService,
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
            entityName: `${savedSpeaker.firstName} ${savedSpeaker.lastName}`
          });
        }
      }
    }
    
    this.logger.log('Speaker created:', savedSpeaker);
    return savedSpeaker;
  }

  async findAll(eventId?: string): Promise<Speaker[]> {
    this.logger.log(`Finding all speakers${eventId ? ` for event: ${eventId}` : ''}`);
    
    const query = eventId ? { eventId } : {};
    const speakers = await this.speakerModel.find(query).sort({ lastName: 1 }).exec();
    
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

  async update(id: string, updateSpeakerDto: UpdateSpeakerDto): Promise<Speaker> {
    this.logger.log(`Updating speaker ${id}`);
    
    const speaker = await this.speakerModel.findById(id);
    if (!speaker) {
      throw new NotFoundException('Speaker not found');
    }

    // Si l'image est modifiée, mettre à jour les utilisations
    if (updateSpeakerDto.imageUrl && updateSpeakerDto.imageUrl !== speaker.imageUrl) {
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
            entityId: speaker._id.toString(),
            entityName: `${updateSpeakerDto.firstName || speaker.firstName} ${updateSpeakerDto.lastName || speaker.lastName}`
          });
        }
      }
    }

    Object.assign(speaker, updateSpeakerDto);
    return speaker.save();
  }

  async remove(id: string): Promise<Speaker> {
    this.logger.log(`Removing speaker ${id}`);

    const speaker = await this.speakerModel.findByIdAndDelete(id).exec();
    if (!speaker) {
      this.logger.error(`Speaker not found with id: ${id}`);
      throw new NotFoundException('Speaker not found');
    }

    this.logger.log('Speaker removed:', speaker);
    return speaker;
  }

  async findByEvent(eventId: string): Promise<Speaker[]> {
    this.logger.log(`Finding speakers for event: ${eventId}`);
    
    const speakers = await this.speakerModel.find({ eventId }).sort({ lastName: 1 }).exec();
    this.logger.log(`Found ${speakers.length} speakers for event`);
    
    return speakers;
  }

  async findByRoom(roomId: string): Promise<Speaker[]> {
    this.logger.log(`Finding speakers for room: ${roomId}`);
    
    const speakers = await this.speakerModel.find({ rooms: roomId }).sort({ lastName: 1 }).exec();
    this.logger.log(`Found ${speakers.length} speakers for room`);
    
    return speakers;
  }
}
