import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ModerationLog, ModerationAction } from '../schemas/moderation-log.schema';
import { ChatRoom } from '../schemas/chat-room.schema';
import { Message } from '../schemas/message.schema';

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  constructor(
    @InjectQueue('moderation')
    private readonly moderationQueue: Queue,
    @InjectQueue('notification')
    private readonly notificationQueue: Queue,
    @InjectModel(ModerationLog.name)
    private readonly moderationLogModel: Model<ModerationLog>,
    @InjectModel(ChatRoom.name)
    private readonly chatRoomModel: Model<ChatRoom>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
  ) {}

  async banUser(
    roomId: Types.ObjectId,
    targetUserId: Types.ObjectId,
    moderatorId: Types.ObjectId,
    reason?: string,
  ): Promise<void> {
    await this.moderationQueue.add('moderation-action', {
      action: ModerationAction.BAN,
      roomId,
      targetUserId,
      moderatorId,
      reason,
    });
  }

  async unbanUser(
    roomId: Types.ObjectId,
    targetUserId: Types.ObjectId,
    moderatorId: Types.ObjectId,
    reason?: string,
  ): Promise<void> {
    await this.moderationQueue.add('moderation-action', {
      action: ModerationAction.UNBAN,
      roomId,
      targetUserId,
      moderatorId,
      reason,
    });
  }

  async muteUser(
    roomId: Types.ObjectId,
    targetUserId: Types.ObjectId,
    moderatorId: Types.ObjectId,
    duration: number,
    reason?: string,
  ): Promise<void> {
    await this.moderationQueue.add('moderation-action', {
      action: ModerationAction.MUTE,
      roomId,
      targetUserId,
      moderatorId,
      duration,
      reason,
    });
  }

  async unmuteUser(
    roomId: Types.ObjectId,
    targetUserId: Types.ObjectId,
    moderatorId: Types.ObjectId,
    reason?: string,
  ): Promise<void> {
    await this.moderationQueue.add('moderation-action', {
      action: ModerationAction.UNMUTE,
      roomId,
      targetUserId,
      moderatorId,
      reason,
    });
  }

  async deleteMessage(
    messageId: Types.ObjectId,
    moderatorId: Types.ObjectId,
    reason?: string,
  ): Promise<void> {
    const message = await this.messageModel.findById(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    await this.moderationQueue.add('moderation-action', {
      action: ModerationAction.DELETE_MESSAGE,
      roomId: message.roomId,
      targetUserId: message.userId,
      moderatorId,
      messageId,
      reason,
    });
  }

  async filterContent(
    messageId: Types.ObjectId,
    content: string,
    roomId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    await this.moderationQueue.add('content-filter', {
      messageId,
      content,
      roomId,
      userId,
    });
  }

  async getModerationLogs(
    roomId: Types.ObjectId,
    options: {
      limit?: number;
      offset?: number;
      actions?: ModerationAction[];
      targetUserId?: Types.ObjectId;
      moderatorId?: Types.ObjectId;
    } = {},
  ): Promise<ModerationLog[]> {
    try {
      const query: any = { roomId };

      if (options.actions?.length) {
        query.action = { $in: options.actions };
      }
      if (options.targetUserId) {
        query.targetUserId = options.targetUserId;
      }
      if (options.moderatorId) {
        query.moderatorId = options.moderatorId;
      }

      return this.moderationLogModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(options.offset || 0)
        .limit(options.limit || 50)
        .populate('moderatorId', 'username')
        .populate('targetUserId', 'username')
        .exec();
    } catch (error) {
      this.logger.error(`Error getting moderation logs: ${error.message}`);
      throw error;
    }
  }

  async getRoomModerationStats(roomId: Types.ObjectId): Promise<{
    totalActions: number;
    actionsByType: Record<ModerationAction, number>;
    activeModeratorCount: number;
    recentActions: number;
  }> {
    try {
      const [totalActions, actionsByType, activeModeratorCount, recentActions] = await Promise.all([
        this.moderationLogModel.countDocuments({ roomId }),
        this.moderationLogModel.aggregate([
          { $match: { roomId: new Types.ObjectId(roomId) } },
          { $group: { _id: '$action', count: { $sum: 1 } } },
        ]),
        this.moderationLogModel.distinct('moderatorId', { roomId }).exec(),
        this.moderationLogModel.countDocuments({
          roomId,
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        }),
      ]);

      const actionCounts = actionsByType.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      }, {} as Record<ModerationAction, number>);

      return {
        totalActions,
        actionsByType: actionCounts,
        activeModeratorCount: activeModeratorCount.length,
        recentActions,
      };
    } catch (error) {
      this.logger.error(`Error getting room moderation stats: ${error.message}`);
      throw error;
    }
  }
}
