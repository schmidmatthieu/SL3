import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SpeakersService } from './speakers.service';
import { SpeakersController } from './speakers.controller';
import { Speaker, SpeakerSchema } from './schemas/speaker.schema';
import { MediaModule } from '../media/media.module';
import { RoomModule } from '../rooms/room.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Speaker.name, schema: SpeakerSchema }]),
    MediaModule,
    forwardRef(() => RoomModule),
  ],
  controllers: [SpeakersController],
  providers: [SpeakersService],
  exports: [SpeakersService],
})
export class SpeakersModule {}
