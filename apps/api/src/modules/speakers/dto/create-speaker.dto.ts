import { IsString, IsOptional, IsArray, IsUrl, ValidateNested, IsMongoId, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

class SocialLinksDto {
  @IsOptional()
  @ValidateIf((o) => o.linkedin !== '')
  @IsUrl({ require_protocol: true }, { message: 'LinkedIn URL must be a valid URL or empty' })
  linkedin?: string;

  @IsOptional()
  @ValidateIf((o) => o.twitter !== '')
  @IsUrl({ require_protocol: true }, { message: 'Twitter URL must be a valid URL or empty' })
  twitter?: string;
}

export class CreateSpeakerDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rooms?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;

  @IsMongoId()
  eventId: string;
}
