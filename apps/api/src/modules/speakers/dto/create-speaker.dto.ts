import { IsString, IsArray, IsOptional, IsMongoId } from 'class-validator';

export class CreateSpeakerDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  imageUrl?: string = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  rooms?: string[] = [];

  @IsMongoId()
  eventId: string;
}
