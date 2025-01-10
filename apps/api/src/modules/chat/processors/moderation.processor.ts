import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from '../schemas/message.schema';
import { ModerationLog, ModerationAction, ModerationTrigger } from '../schemas/moderation-log.schema';
import { ChatRoom } from '../schemas/chat-room.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';

interface ContentFilterJob {
  messageId: string;
  content: string;
  roomId: string;
  userId: string;
}

interface ModerationActionJob {
  action: ModerationAction;
  roomId: string;
  targetUserId: string;
  moderatorId: string;
  reason?: string;
  duration?: number;
  messageId?: string;
}

@Processor('moderation')
export class ModerationProcessor {
  private readonly logger = new Logger(ModerationProcessor.name);

  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoom>,
    @InjectModel(ModerationLog.name) private moderationLogModel: Model<ModerationLog>,
    private eventEmitter: EventEmitter2,
  ) {}

  @Process('content-filter')
  async handleContentFilter(job: Job<ContentFilterJob>) {
    try {
      const { messageId, content, roomId, userId } = job.data;
      
      // Récupérer les règles de modération de la room
      const room = await this.chatRoomModel.findById(roomId);
      if (!room || !room.chatSettings.autoModeration.enabled) {
        return;
      }

      const violations = await this.checkContent(content, room.chatSettings.autoModeration);
      
      if (violations.length > 0) {
        // Créer un log de modération
        const moderationLog = new this.moderationLogModel({
          roomId,
          moderatorId: 'system', // ID spécial pour le système
          targetUserId: userId,
          action: ModerationAction.FLAG,
          trigger: ModerationTrigger.AUTO,
          reason: `Automatic content filter: ${violations.join(', ')}`,
          messageId,
          metadata: { violations },
        });
        await moderationLog.save();

        // Émettre un événement pour notification
        this.eventEmitter.emit('chat.moderation.content.flagged', {
          messageId,
          roomId,
          userId,
          violations,
        });

        // Si configuré pour suppression automatique
        if (room.chatSettings.autoModeration.autoDelete) {
          await this.messageModel.findByIdAndUpdate(messageId, {
            isDeleted: true,
            metadata: { deletedBy: 'system', reason: 'Content filter violation' },
          });

          this.eventEmitter.emit('chat.message.deleted', {
            messageId,
            roomId,
            reason: 'Content filter violation',
          });
        }
      }
    } catch (error) {
      this.logger.error(`Error in content filter: ${error.message}`);
      throw error;
    }
  }

  @Process('moderation-action')
  async handleModerationAction(job: Job<ModerationActionJob>) {
    try {
      const { action, roomId, targetUserId, moderatorId, reason, duration, messageId } = job.data;

      const log = new this.moderationLogModel({
        roomId,
        moderatorId,
        targetUserId,
        action,
        trigger: ModerationTrigger.MANUAL,
        reason,
        duration,
        messageId,
        expiresAt: duration ? new Date(Date.now() + duration * 60000) : undefined,
      });
      await log.save();

      // Appliquer l'action
      switch (action) {
        case ModerationAction.BAN:
          await this.chatRoomModel.findOneAndUpdate(
            { _id: roomId, 'participants.userId': targetUserId },
            {
              $set: {
                'participants.$.isBanned': true,
                'participants.$.banReason': reason,
                'participants.$.bannedAt': new Date(),
              },
            },
          );
          break;

        case ModerationAction.MUTE:
          await this.chatRoomModel.findOneAndUpdate(
            { _id: roomId, 'participants.userId': targetUserId },
            {
              $set: {
                'participants.$.isMuted': true,
                'participants.$.mutedUntil': new Date(Date.now() + duration * 60000),
              },
            },
          );
          break;

        case ModerationAction.DELETE_MESSAGE:
          if (messageId) {
            await this.messageModel.findByIdAndUpdate(messageId, {
              isDeleted: true,
              metadata: { deletedBy: moderatorId, reason },
            });
          }
          break;
      }

      // Émettre un événement
      this.eventEmitter.emit('chat.moderation.action', {
        action,
        roomId,
        targetUserId,
        moderatorId,
        reason,
        duration,
        messageId,
      });

    } catch (error) {
      this.logger.error(`Error in moderation action: ${error.message}`);
      throw error;
    }
  }

  private async checkContent(content: string, settings: any): Promise<string[]> {
    const violations: string[] = [];

    if (settings.profanityFilter) {
      // Implémenter la logique de filtrage des grossièretés
      const hasProfanity = await this.checkProfanity(content);
      if (hasProfanity) {
        violations.push('profanity');
      }
    }

    if (settings.spamFilter) {
      // Implémenter la logique de détection du spam
      const isSpam = this.checkSpam(content);
      if (isSpam) {
        violations.push('spam');
      }
    }

    if (settings.linkFilter) {
      // Implémenter la logique de filtrage des liens
      const hasUnallowedLinks = this.checkLinks(content);
      if (hasUnallowedLinks) {
        violations.push('unallowed_links');
      }
    }

    return violations;
  }

  private async checkProfanity(content: string): Promise<boolean> {
    // TODO: Implémenter avec une bibliothèque de filtrage
    return false;
  }

  private checkSpam(content: string): boolean {
    // Règles simples de détection du spam
    const hasRepeatedCharacters = /(.)\1{10,}/.test(content);
    const hasAllCaps = content.length > 20 && content === content.toUpperCase();
    return hasRepeatedCharacters || hasAllCaps;
  }

  private checkLinks(content: string): boolean {
    // Règles simples de détection des liens
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return urlRegex.test(content);
  }
}
