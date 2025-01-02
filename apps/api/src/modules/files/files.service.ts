import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly uploadDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadDir();
  }

  private async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    type: 'avatar' | 'other' = 'other',
  ): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${type}_${userId}_${crypto.randomBytes(8).toString('hex')}${fileExtension}`;
    const filePath = path.join(this.uploadDir, fileName);

    try {
      await fs.writeFile(filePath, file.buffer);
      const baseUrl = this.configService.get<string>(
        'app.baseUrl',
        'http://localhost:3001',
      );
      return `${baseUrl}/uploads/${fileName}`;
    } catch (error) {
      this.logger.error(`Failed to save file: ${error.message}`, error.stack);
      throw new Error('Failed to save file');
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const fileName = path.basename(fileUrl);
      const filePath = path.join(this.uploadDir, fileName);
      await fs.unlink(filePath);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      // Don't throw error if file doesn't exist
    }
  }
}
