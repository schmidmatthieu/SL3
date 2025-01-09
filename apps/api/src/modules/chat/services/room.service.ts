import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatRoom } from '../schemas/chat-room.schema';
import { UserRole } from '../../users/schemas/user.schema';
import { ChatParticipant } from '../interfaces/participant.interface';

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name);

  constructor(
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoom>,
  ) {}

  async getRoomsForUser(userId: Types.ObjectId): Promise<ChatRoom[]> {
    try {
      return this.chatRoomModel
        .find({
          'participants.userId': userId,
          'settings.chatEnabled': true,
          'settings.isArchived': false,
        })
        .exec();
    } catch (error) {
      this.logger.error(`Error getting rooms for user: ${error.message}`);
      throw error;
    }
  }

  async canUserJoinRoom(userId: Types.ObjectId, roomId: Types.ObjectId): Promise<boolean> {
    try {
      const room = await this.chatRoomModel.findById(roomId);
      if (!room) {
        return false;
      }

      const participant = room.participants.find(p => p.userId.equals(userId));
      return participant && !participant.isBanned && !participant.leftAt;
    } catch (error) {
      this.logger.error(`Error checking room access: ${error.message}`);
      return false;
    }
  }

  async addUserToRoom(userId: Types.ObjectId, roomId: Types.ObjectId): Promise<void> {
    try {
      const room = await this.chatRoomModel.findById(roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      const existingParticipant = room.participants.find(p => p.userId.equals(userId));
      if (existingParticipant) {
        if (existingParticipant.isBanned) {
          throw new Error('User is banned from this room');
        }
        if (existingParticipant.leftAt) {
          existingParticipant.leftAt = undefined;
          await room.save();
        }
        return;
      }

      const newParticipant: ChatParticipant = {
        userId,
        joinedAt: new Date(),
        role: UserRole.PARTICIPANT,
        isMuted: false,
        isOnline: true,
        isBanned: false,
        leftAt: undefined,
      };

      room.participants.push(newParticipant);
      await room.save();
    } catch (error) {
      this.logger.error(`Error adding user to room: ${error.message}`);
      throw error;
    }
  }

  async removeUserFromRoom(userId: Types.ObjectId, roomId: Types.ObjectId): Promise<void> {
    try {
      const room = await this.chatRoomModel.findById(roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      const participant = room.participants.find(p => p.userId.equals(userId));
      if (!participant) {
        return;
      }

      participant.leftAt = new Date();
      await room.save();
    } catch (error) {
      this.logger.error(`Error removing user from room: ${error.message}`);
      throw error;
    }
  }

  async banUserFromRoom(
    userId: Types.ObjectId,
    roomId: Types.ObjectId,
    reason?: string
  ): Promise<void> {
    try {
      const room = await this.chatRoomModel.findById(roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      const participant = room.participants.find(p => p.userId.equals(userId));
      if (!participant) {
        return;
      }

      participant.isBanned = true;
      participant.banReason = reason;
      participant.bannedAt = new Date();

      await room.save();
    } catch (error) {
      this.logger.error(`Error banning user from room: ${error.message}`);
      throw error;
    }
  }
}
