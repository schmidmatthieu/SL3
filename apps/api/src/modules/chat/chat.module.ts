import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '../../redis';
import { ChatGateway } from './gateways/chat.gateway';
import { ChatService } from './services/chat.service';
import { RoomService } from './services/room.service';
import { RecoveryService } from './services/recovery.service';
import { ModerationService } from './services/moderation.service';
import { RecoveryTask } from './tasks/recovery.task';
import { Message, MessageSchema } from './schemas/message.schema';
import { ChatRoom, ChatRoomSchema } from './schemas/chat-room.schema';
import { RecoveryLog, RecoveryLogSchema } from './schemas/recovery-log.schema';
import { ModerationLog, ModerationLogSchema } from './schemas/moderation-log.schema';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { ModerationProcessor } from './processors/moderation.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { AuthModule } from '../auth/auth.module';
import { WsAuthGuard } from './guards/ws-auth.guard';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule,
    RedisModule.forFeature(),
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: RecoveryLog.name, schema: RecoveryLogSchema },
      { name: ModerationLog.name, schema: ModerationLogSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: parseInt(configService.get('REDIS_PORT')),
          password: configService.get('REDIS_PASSWORD'),
          db: 0, // Utilisation de la base de données 0 par défaut
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: 'moderation' },
      { name: 'notification' },
      { name: 'recovery' }
    ),
    AuthModule,
    UsersModule,
    EventEmitterModule.forRoot(),
  ],
  providers: [
    ChatGateway,
    ChatService,
    RoomService,
    RecoveryService,
    ModerationService,
    RecoveryTask,
    ModerationProcessor,
    NotificationProcessor,
    WsAuthGuard,
  ],
  exports: [ChatService, RoomService],
})
export class ChatModule {}
