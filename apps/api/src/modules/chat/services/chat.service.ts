import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from '../schemas/message.schema';
import { ChatRoom } from '../schemas/chat-room.schema';

interface CreateMessageDto {
  roomId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  replyTo?: Types.ObjectId;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoom>,
  ) {}

  async createMessage(dto: CreateMessageDto): Promise<Message> {
    try {
      const room = await this.chatRoomModel.findById(dto.roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      if (!room.canSendMessage(dto.userId)) {
        throw new Error('Not allowed to send messages in this room');
      }

      const message = new this.messageModel({
        roomId: dto.roomId,
        userId: dto.userId,
        content: dto.content,
        replyTo: dto.replyTo,
      });

      await message.save();
      return message;
    } catch (error) {
      this.logger.error(`Error creating message: ${error.message}`);
      throw error;
    }
  }

  async getMessages(roomId: Types.ObjectId, options: {
    limit?: number;
    before?: Date;
    after?: Date;
  } = {}): Promise<Message[]> {
    try {
      const query: any = { roomId };

      if (options.before) {
        query.createdAt = { ...query.createdAt, $lt: options.before };
      }
      if (options.after) {
        query.createdAt = { ...query.createdAt, $gt: options.after };
      }

      return this.messageModel
        .find(query)
        .sort({ createdAt: -1 })
        .limit(options.limit || 50)
        .exec();
    } catch (error) {
      this.logger.error(`Error getting messages: ${error.message}`);
      throw error;
    }
  }

  async deleteMessage(messageId: Types.ObjectId, userId: Types.ObjectId): Promise<void> {
    try {
      const message = await this.messageModel.findById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      if (message.userId.toString() !== userId.toString()) {
        throw new Error('Not allowed to delete this message');
      }

      await message.deleteOne();
    } catch (error) {
      this.logger.error(`Error deleting message: ${error.message}`);
      throw error;
    }
  }

  async updateMessage(
    messageId: Types.ObjectId,
    userId: Types.ObjectId,
    content: string
  ): Promise<Message> {
    try {
      const message = await this.messageModel.findById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      if (message.userId.toString() !== userId.toString()) {
        throw new Error('Not allowed to edit this message');
      }

      message.content = content;
      message.edited = true;
      message.editedAt = new Date();

      await message.save();
      return message;
    } catch (error) {
      this.logger.error(`Error updating message: ${error.message}`);
      throw error;
    }
  }
}
