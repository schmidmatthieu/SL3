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
import { REDIS_PROVIDER } from '../../redis/constants/redis.constants';
import { IRedisService } from '../../redis/interfaces/redis.interface';
import { Inject } from '@nestjs/common';
import * as fs from 'fs/promises';

@Injectable()
export class MediaService {
  private readonly uploadPath: string;
  private readonly apiUrl: string;
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly CACHE_PREFIX = 'media:';

  constructor(
    @InjectModel(Media.name) private mediaModel: Model<MediaDocument>,
    @Inject(REDIS_PROVIDER) private redisService: IRedisService,
    private configService: ConfigService,
  ) {
    this.uploadPath = this.configService.get('UPLOAD_PATH') || path.join(process.cwd(), 'public', 'uploads');
    this.apiUrl = this.configService.get('API_URL') || 'http://localhost:3001';
  }

  private getCacheKey(id: string): string {
    return `${this.CACHE_PREFIX}${id}`;
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
    const savedMedia = await createdMedia.save();
    
    // Cache the new media
    await this.redisService.set(
      this.getCacheKey(savedMedia.id),
      JSON.stringify(savedMedia),
      this.CACHE_TTL
    );
    
    return savedMedia;
  }

  async findAll(query?: FilterQuery<MediaDocument>): Promise<Media[]> {
    // For findAll, we don't use cache as it could be too large and change frequently
    return this.mediaModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Media> {
    // Try to get from cache first
    const cached = await this.redisService.get(this.getCacheKey(id));
    if (cached) {
      return JSON.parse(cached);
    }

    const media = await this.mediaModel.findById(id).exec();
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    // Cache the result
    await this.redisService.set(
      this.getCacheKey(id),
      JSON.stringify(media),
      this.CACHE_TTL
    );

    return media;
  }

  async findByFilename(filename: string): Promise<MediaDocument | null> {
    const cacheKey = `${this.CACHE_PREFIX}filename:${filename}`;
    
    // Try to get from cache first
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const media = await this.mediaModel.findOne({ filename }).exec();
    
    if (media) {
      // Cache the result
      await this.redisService.set(
        cacheKey,
        JSON.stringify(media),
        this.CACHE_TTL
      );
    }

    return media;
  }

  async findByUsageType(type: MediaUsage['type']): Promise<Media[]> {
    const cacheKey = `${this.CACHE_PREFIX}type:${type}`;
    
    // Try to get from cache first
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const media = await this.mediaModel
      .find({
        'usages.type': type,
      })
      .sort({ createdAt: -1 })
      .exec();

    // Cache the result
    await this.redisService.set(
      cacheKey,
      JSON.stringify(media),
      this.CACHE_TTL
    );

    return media;
  }

  async findUnused(): Promise<Media[]> {
    const cacheKey = `${this.CACHE_PREFIX}unused`;
    
    // Try to get from cache first
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const media = await this.mediaModel
      .find({
        usages: { $size: 0 },
      })
      .sort({ createdAt: -1 })
      .exec();

    // Cache the result
    await this.redisService.set(
      cacheKey,
      JSON.stringify(media),
      this.CACHE_TTL
    );

    return media;
  }

  async update(id: string, updateMediaDto: UpdateMediaDto): Promise<Media> {
    const media = await this.mediaModel
      .findByIdAndUpdate(id, updateMediaDto, { new: true })
      .exec();
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    // Update cache
    await this.redisService.set(
      this.getCacheKey(id),
      JSON.stringify(media),
      this.CACHE_TTL
    );

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

    const savedMedia = await media.save();

    // Update cache
    await this.redisService.set(
      this.getCacheKey(mediaId),
      JSON.stringify(savedMedia),
      this.CACHE_TTL
    );

    // Invalidate type-based caches
    await this.redisService.del(`${this.CACHE_PREFIX}type:${usage.type}`);
    await this.redisService.del(`${this.CACHE_PREFIX}unused`);

    return savedMedia;
  }

  async removeUsage(mediaId: string, entityId: string): Promise<Media> {
    const media = await this.mediaModel.findById(mediaId);
    if (!media) {
      throw new NotFoundException(`Media with ID ${mediaId} not found`);
    }

    const usageIndex = media.usages.findIndex(u => u.entityId === entityId);
    if (usageIndex === -1) {
      throw new NotFoundException(`Usage for entity ${entityId} not found`);
    }

    const usageType = media.usages[usageIndex].type;
    media.usages.splice(usageIndex, 1);
    const savedMedia = await media.save();

    // Update cache
    await this.redisService.set(
      this.getCacheKey(mediaId),
      JSON.stringify(savedMedia),
      this.CACHE_TTL
    );

    // Invalidate type-based caches
    await this.redisService.del(`${this.CACHE_PREFIX}type:${usageType}`);
    await this.redisService.del(`${this.CACHE_PREFIX}unused`);

    return savedMedia;
  }

  async remove(id: string): Promise<void> {
    const media = await this.mediaModel.findById(id);
    if (!media) {
      throw new NotFoundException(`Media with ID ${id} not found`);
    }

    // Delete from filesystem
    try {
      const filePath = path.join(this.uploadPath, media.filename);
      await fs.unlink(filePath);
    } catch (error) {
      console.error(`Error deleting file: ${error.message}`);
    }

    // Delete from database
    await this.mediaModel.findByIdAndDelete(id);

    // Delete from cache
    await this.redisService.del(this.getCacheKey(id));
    
    // Invalidate type-based caches
    for (const usage of media.usages) {
      await this.redisService.del(`${this.CACHE_PREFIX}type:${usage.type}`);
    }
    await this.redisService.del(`${this.CACHE_PREFIX}unused`);
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
