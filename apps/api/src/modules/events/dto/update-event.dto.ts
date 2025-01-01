import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { EventStatus } from '../schemas/event.schema';
import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDto) {}