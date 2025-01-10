import { Module, NestModule, MiddlewareConsumer, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { EventsModule } from './modules/events/events.module';
import { SpeakersModule } from './modules/speakers/speakers.module';
import { MediaModule } from './modules/media/media.module';
import { RoomModule } from './modules/rooms/room.module';
import { ChatModule } from './modules/chat/chat.module';
import { RedisModule } from './redis';
import { LoggerMiddleware } from './middleware/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        Logger.log(`Connecting to MongoDB at: ${uri}`);
        return {
          uri,
        };
      },
      inject: [ConfigService],
    }),
    RedisModule.forRoot(),
    AuthModule,
    UsersModule,
    RolesModule,
    EventsModule,
    SpeakersModule,
    MediaModule,
    RoomModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  private readonly logger = new Logger(AppModule.name);

  configure(consumer: MiddlewareConsumer) {
    this.logger.log('Configuring global middleware');
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
