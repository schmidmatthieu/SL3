import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Media, MediaDocument } from './schemas/media.schema';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(Media.name) private mediaModel: Model<MediaDocument>,
  ) {}

  async create(file: Express.Multer.File, userId: string): Promise<Media> {
    const baseUrl = process.env.API_URL || 'http://localhost:3001';
    const mediaUrl = `${baseUrl}/uploads/${file.filename}`;

    const createMediaDto: CreateMediaDto = {
      filename: file.filename,
      url: mediaUrl,
      mimeType: file.mimetype,
    };

    const createdMedia = new this.mediaModel({
      ...createMediaDto,
      size: file.size,
      uploadedBy: userId,
    });

    return createdMedia.save();
  }

  async findAll(): Promise<Media[]> {
    return this.mediaModel.find().exec();
  }

  async findOne(id: string): Promise<Media> {
    const media = await this.mediaModel.findById(id).exec();
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
    return media;
  }

  async update(id: string, updateMediaDto: UpdateMediaDto): Promise<Media> {
    const media = await this.mediaModel
      .findByIdAndUpdate(id, updateMediaDto, { new: true })
      .exec();
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
    return media;
  }

  async remove(id: string): Promise<void> {
    const media = await this.findOne(id);
    const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadsPath, media.filename);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error(`Error deleting file: ${error.message}`);
    }

    await this.mediaModel.findByIdAndDelete(id).exec();
  }
}
