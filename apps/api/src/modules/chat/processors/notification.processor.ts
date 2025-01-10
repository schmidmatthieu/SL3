import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationType, NotificationPriority } from '../schemas/notification.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';

interface CreateNotificationJob {
  userId: string;
  roomId: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  content: string;
  messageId?: string;
  data?: Record<string, any>;
  expiresAt?: Date;
}

interface ProcessMentionsJob {
  messageId: string;
  content: string;
  roomId: string;
  userId: string;
}

@Processor('notification')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    private eventEmitter: EventEmitter2,
  ) {}

  @Process('create')
  async handleCreate(job: Job<CreateNotificationJob>) {
    try {
      const notification = new this.notificationModel({
        ...job.data,
        read: false,
      });

      await notification.save();

      // Émettre un événement pour le système de notification en temps réel
      this.eventEmitter.emit('chat.notification.created', {
        notificationId: notification._id,
        userId: notification.userId,
        type: notification.type,
        priority: notification.priority,
      });

      return notification;
    } catch (error) {
      this.logger.error(`Error creating notification: ${error.message}`);
      throw error;
    }
  }

  @Process('process-mentions')
  async handleMentions(job: Job<ProcessMentionsJob>) {
    try {
      const { messageId, content, roomId, userId } = job.data;

      // Extraire les mentions (@username)
      const mentions = content.match(/@(\w+)/g) || [];
      if (mentions.length === 0) return;

      // Créer une notification pour chaque mention
      const uniqueMentions = [...new Set(mentions)];
      for (const mention of uniqueMentions) {
        const username = mention.replace('@', ''); // Enlever le @

        // TODO: Récupérer l'ID de l'utilisateur à partir du username
        // const mentionedUser = await this.userService.findByUsername(username);
        // if (!mentionedUser) continue;

        await this.notificationModel.create({
          userId: 'mentionedUser.id', // TODO: Utiliser l'ID réel
          roomId,
          type: NotificationType.MENTION,
          priority: NotificationPriority.HIGH,
          title: 'Nouvelle mention',
          content: `@${username} vous a mentionné dans un message`,
          messageId,
          data: {
            mentionedBy: userId,
            messageContent: content,
          },
        });
      }
    } catch (error) {
      this.logger.error(`Error processing mentions: ${error.message}`);
      throw error;
    }
  }

  @Process('cleanup')
  async handleCleanup(job: Job) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Supprimer les notifications lues de plus de 30 jours
      await this.notificationModel.deleteMany({
        read: true,
        createdAt: { $lt: thirtyDaysAgo },
      });

      // Marquer comme lues les notifications non lues de plus de 30 jours
      await this.notificationModel.updateMany(
        {
          read: false,
          createdAt: { $lt: thirtyDaysAgo },
        },
        {
          $set: {
            read: true,
            readAt: new Date(),
            metadata: { autoRead: true },
          },
        },
      );
    } catch (error) {
      this.logger.error(`Error in notification cleanup: ${error.message}`);
      throw error;
    }
  }
}
