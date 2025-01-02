import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class UpdateUserDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'john_doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'The preferred language of the user',
    example: 'fr',
    enum: ['en', 'fr', 'de', 'it'],
    required: false,
  })
  @IsEnum(['en', 'fr', 'de', 'it'])
  @IsOptional()
  preferredLanguage?: string;

  @ApiProperty({
    description: 'The theme preference of the user',
    example: 'dark',
    enum: ['light', 'dark', 'system'],
    required: false,
  })
  @IsString()
  @IsOptional()
  theme?: string;

  @ApiProperty({
    description: 'The biography of the user',
    example: 'Software developer passionate about web technologies',
    required: false,
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({
    description: "The URL of the user's profile image",
    example: 'http://example.com/avatar.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
