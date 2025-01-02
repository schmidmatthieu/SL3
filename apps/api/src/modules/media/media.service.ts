import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Media, MediaDocument } from './schemas/media.schema';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { MediaUsage } from './types/media.types';
import * as path from 'path';
import { writeFile } from 'fs/promises';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MediaService {
  private readonly uploadPath: string;
  private readonly apiUrl: string;

  constructor(
    @InjectModel(Media.name) private mediaModel: Model<MediaDocument>,
    private configService: ConfigService,
  ) {
    this.uploadPath = path.join(process.cwd(), 'public', 'uploads');
    this.apiUrl =
      this.configService.get('API_URL') ||
      `http://localhost:${this.configService.get('port')}`;
  }

  async create(file: Express.Multer.File, userId: string): Promise<Media> {
    const createMediaDto: CreateMediaDto = {
      filename: file.filename,
      url: `${this.apiUrl}/uploads/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size,
      uploadedBy: userId,
    };

    const createdMedia = new this.mediaModel(createMediaDto);
    return createdMedia.save();
  }

  async findAll(query?: FilterQuery<MediaDocument>): Promise<Media[]> {
    return this.mediaModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Media> {
    const media = await this.mediaModel.findById(id).exec();
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }
    return media;
  }

  async findByUsageType(type: MediaUsage['type']): Promise<Media[]> {
    return this.mediaModel
      .find({
        'usages.type': type,
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findUnused(): Promise<Media[]> {
    return this.mediaModel
      .find({
        usages: { $size: 0 },
      })
      .sort({ createdAt: -1 })
      .exec();
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

  async addUsage(
    mediaId: string,
    usage: Omit<MediaUsage, 'usedAt'>,
  ): Promise<Media> {
    const media = await this.mediaModel.findById(mediaId);
    if (!media) {
      throw new NotFoundException(`Media with ID ${mediaId} not found`);
    }

    media.usages = media.usages || [];
    media.usages.push({
      ...usage,
      usedAt: new Date(),
    });

    return media.save();
  }

  async removeUsage(mediaId: string, entityId: string): Promise<Media> {
    const media = await this.mediaModel.findById(mediaId);
    if (!media) {
      throw new NotFoundException(`Media with ID ${mediaId} not found`);
    }

    media.usages = media.usages.filter((usage) => usage.entityId !== entityId);
    return media.save();
  }

  async updateUsageEntityName(
    type: MediaUsage['type'],
    entityId: string,
    entityName: string,
  ): Promise<void> {
    await this.mediaModel.updateMany(
      { 'usages.type': type, 'usages.entityId': entityId },
      { $set: { 'usages.$[elem].entityName': entityName } },
      { arrayFilters: [{ 'elem.type': type, 'elem.entityId': entityId }] },
    );
  }

  async findByFilename(filename: string): Promise<MediaDocument | null> {
    return this.mediaModel.findOne({ filename }).exec();
  }

  async remove(id: string): Promise<void> {
    const media = await this.findOne(id);
    const filePath = path.join(this.uploadPath, media.filename);

    try {
      await writeFile(filePath, '');
      await writeFile(filePath, '', { flag: 'w' });
    } catch (error) {
      console.error(`Error deleting file: ${error.message}`);
    }

    await this.mediaModel.findByIdAndDelete(id).exec();
  }

  async uploadFromUrl(url: string, userId: string): Promise<Media> {
    try {
      // Télécharger l'image depuis l'URL
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Obtenir le type MIME et l'extension
      const contentType = response.headers.get('content-type');
      const ext = contentType?.split('/')[1] || 'jpg';

      // Générer un nom de fichier unique
      const filename = `url_${Date.now()}.${ext}`;

      // Sauvegarder le fichier
      const filePath = path.join(this.uploadPath, filename);
      await writeFile(filePath, buffer);

      // Créer l'entrée dans la base de données avec le chemin complet de l'API
      const media = new this.mediaModel({
        filename,
        url: `${this.apiUrl}/uploads/${filename}`,
        mimeType: contentType,
        size: buffer.length,
        uploadedBy: userId,
        metadata: {
          source: 'url',
          originalUrl: url,
        },
      });

      return await media.save();
    } catch (error) {
      throw new BadRequestException(
        `Erreur lors de l'import de l'image depuis l'URL: ${error.message}`,
      );
    }
  }
}
