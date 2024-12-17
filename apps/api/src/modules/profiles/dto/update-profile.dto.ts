import { IsString, IsOptional, IsUrl, IsEnum } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  preferredLanguage?: string;

  @IsEnum(['dark', 'light', 'system'])
  @IsOptional()
  theme?: 'dark' | 'light' | 'system';
}
