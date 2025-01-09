import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatService } from './services/chat.service';
import { RoomService } from './services/room.service';
import { Message, MessageSchema } from './schemas/message.schema';
import { ChatRoom, ChatRoomSchema } from './schemas/chat-room.schema';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../../config/redis.module';
import { WsAuthGuard } from './guards/ws-auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
    ]),
    AuthModule,
    RedisModule,
  ],
  providers: [
    ChatGateway,
    ChatService,
    RoomService,
    WsAuthGuard,
  ],
  exports: [ChatService, RoomService],
})
export class ChatModule {}
