import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from '../schemas/message.schema';
import { ChatRoom } from '../schemas/chat-room.schema';
import { RecoveryLog, RecoveryType, RecoveryStatus } from '../schemas/recovery-log.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class RecoveryService {
  private readonly logger = new Logger(RecoveryService.name);

  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoom>,
    @InjectModel(RecoveryLog.name) private recoveryLogModel: Model<RecoveryLog>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Détecte les incohérences dans les données du chat
   */
  async detectInconsistencies(): Promise<RecoveryLog[]> {
    const logs: RecoveryLog[] = [];

    try {
      // 1. Vérifier les messages orphelins (sans room valide)
      const orphanedMessages = await this.findOrphanedMessages();
      for (const message of orphanedMessages) {
        const log = await this.createRecoveryLog({
          type: RecoveryType.ORPHANED_DATA,
          status: RecoveryStatus.DETECTED,
          entity: 'Message',
          entityId: message._id,
          details: {
            problem: 'Message without valid room reference',
            context: { messageId: message._id, roomId: message.roomId },
          },
        });
        logs.push(log);
      }

      // 2. Vérifier les références de réponses invalides
      const invalidReplies = await this.findInvalidReplies();
      for (const message of invalidReplies) {
        const log = await this.createRecoveryLog({
          type: RecoveryType.MISSING_REFERENCE,
          status: RecoveryStatus.DETECTED,
          entity: 'Message',
          entityId: message._id,
          details: {
            problem: 'Message with invalid reply reference',
            context: { messageId: message._id, replyTo: message.replyTo },
          },
        });
        logs.push(log);
      }

      // 3. Vérifier les états incohérents des rooms
      const inconsistentRooms = await this.findInconsistentRooms();
      for (const room of inconsistentRooms) {
        const log = await this.createRecoveryLog({
          type: RecoveryType.INCONSISTENT_STATE,
          status: RecoveryStatus.DETECTED,
          entity: 'ChatRoom',
          entityId: room._id,
          details: {
            problem: 'Room with inconsistent state',
            context: { roomId: room._id },
          },
        });
        logs.push(log);
      }

      this.eventEmitter.emit('chat.recovery.detected', { count: logs.length });
      return logs;
    } catch (error) {
      this.logger.error(`Error detecting inconsistencies: ${error.message}`);
      throw error;
    }
  }

  /**
   * Répare les incohérences détectées
   */
  async repairInconsistencies(): Promise<void> {
    try {
      const pendingLogs = await this.recoveryLogModel
        .find({ status: RecoveryStatus.DETECTED })
        .exec();

      for (const log of pendingLogs) {
        try {
          await this.updateRecoveryLog(log._id, { status: RecoveryStatus.IN_PROGRESS });

          switch (log.type) {
            case RecoveryType.ORPHANED_DATA:
              await this.handleOrphanedData(log);
              break;
            case RecoveryType.MISSING_REFERENCE:
              await this.handleMissingReference(log);
              break;
            case RecoveryType.INCONSISTENT_STATE:
              await this.handleInconsistentState(log);
              break;
          }

          await this.updateRecoveryLog(log._id, {
            status: RecoveryStatus.REPAIRED,
            repairedAt: new Date(),
          });
        } catch (error) {
          await this.updateRecoveryLog(log._id, {
            status: RecoveryStatus.FAILED,
            error: error.message,
          });
        }
      }

      this.eventEmitter.emit('chat.recovery.completed', { count: pendingLogs.length });
    } catch (error) {
      this.logger.error(`Error repairing inconsistencies: ${error.message}`);
      throw error;
    }
  }

  private async findOrphanedMessages(): Promise<Message[]> {
    return this.messageModel
      .aggregate([
        {
          $lookup: {
            from: 'chatrooms',
            localField: 'roomId',
            foreignField: '_id',
            as: 'room',
          },
        },
        {
          $match: {
            room: { $size: 0 },
            isDeleted: false,
          },
        },
      ])
      .exec();
  }

  private async findInvalidReplies(): Promise<Message[]> {
    return this.messageModel
      .aggregate([
        {
          $match: {
            replyTo: { $exists: true },
          },
        },
        {
          $lookup: {
            from: 'messages',
            localField: 'replyTo',
            foreignField: '_id',
            as: 'repliedMessage',
          },
        },
        {
          $match: {
            repliedMessage: { $size: 0 },
          },
        },
      ])
      .exec();
  }

  private async findInconsistentRooms(): Promise<ChatRoom[]> {
    return this.chatRoomModel
      .find({
        $or: [
          { 'participants.userId': { $exists: false } },
          { lastMessageId: { $exists: true }, lastActivityAt: { $exists: false } },
        ],
      })
      .exec();
  }

  private async handleOrphanedData(log: RecoveryLog): Promise<void> {
    if (log.entity === 'Message') {
      await this.messageModel.findByIdAndUpdate(log.entityId, {
        isDeleted: true,
        metadata: { ...log.details, recoveredAt: new Date() },
      });
    }
  }

  private async handleMissingReference(log: RecoveryLog): Promise<void> {
    if (log.entity === 'Message') {
      await this.messageModel.findByIdAndUpdate(log.entityId, {
        $unset: { replyTo: 1 },
        metadata: { ...log.details, recoveredAt: new Date() },
      });
    }
  }

  private async handleInconsistentState(log: RecoveryLog): Promise<void> {
    if (log.entity === 'ChatRoom') {
      const room = await this.chatRoomModel.findById(log.entityId);
      if (!room) return;

      // Mettre à jour lastActivityAt si manquant
      if (room.lastMessageId && !room.lastActivityAt) {
        const lastMessage = await this.messageModel.findById(room.lastMessageId);
        if (lastMessage) {
          room.lastActivityAt = lastMessage.createdAt;
          await room.save();
        }
      }

      // Nettoyer les participants invalides
      room.participants = room.participants.filter(p => p.userId);
      await room.save();
    }
  }

  private async createRecoveryLog(data: Partial<RecoveryLog>): Promise<RecoveryLog> {
    const log = new this.recoveryLogModel(data);
    return log.save();
  }

  private async updateRecoveryLog(
    id: Types.ObjectId,
    update: Partial<RecoveryLog>,
  ): Promise<RecoveryLog | null> {
    return this.recoveryLogModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }
}
