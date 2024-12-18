import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Speaker, SpeakerDocument } from './schemas/speaker.schema';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { UpdateSpeakerDto } from './dto/update-speaker.dto';

@Injectable()
export class SpeakersService {
  private readonly logger = new Logger(SpeakersService.name);

  constructor(
    @InjectModel(Speaker.name) private speakerModel: Model<SpeakerDocument>,
  ) {}

  async create(createSpeakerDto: CreateSpeakerDto): Promise<Speaker> {
    this.logger.log(`Creating speaker for event: ${createSpeakerDto.eventId}`);
    
    const speaker = new this.speakerModel(createSpeakerDto);
    const savedSpeaker = await speaker.save();
    
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
    this.logger.log('Update data:', updateSpeakerDto);

    const speaker = await this.speakerModel.findByIdAndUpdate(
      id,
      { $set: updateSpeakerDto },
      { new: true, runValidators: true }
    ).exec();

    if (!speaker) {
      this.logger.error(`Speaker not found with id: ${id}`);
      throw new NotFoundException('Speaker not found');
    }

    this.logger.log('Speaker updated:', speaker);
    return speaker;
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
