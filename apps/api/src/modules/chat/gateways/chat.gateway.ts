import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsException,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { WsAuthGuard } from '../guards/ws-auth.guard';
import { AuthenticatedSocket, ChatEventPayload, ChatPresencePayload, ChatTypingPayload } from '../types/socket.types';
import { ChatService } from '../services/chat.service';
import { RoomService } from '../services/room.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: 'chat',
})
@UseGuards(WsAuthGuard)
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);
  private readonly connectedClients = new Map<string, Set<string>>();

  constructor(
    private readonly chatService: ChatService,
    private readonly roomService: RoomService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Vérification de l'authentification
      if (!client.user) {
        throw new WsException('Unauthorized');
      }

      this.logger.log(`Client connected: ${client.id} (User: ${client.user.username})`);

      // Rejoindre les rooms auxquelles l'utilisateur a accès
      const rooms = await this.roomService.getRoomsForUser(client.user.id);
      rooms.forEach(room => {
        client.join(room._id.toString());
        this.addClientToRoom(room._id.toString(), client.id);
      });

      // Notifier la présence
      this.broadcastPresence({
        roomId: 'global',
        userId: client.user.id,
        username: client.user.username,
        status: 'online',
      });

    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    try {
      if (client.user) {
        this.logger.log(`Client disconnected: ${client.id} (User: ${client.user.username})`);

        // Notifier la déconnexion
        this.broadcastPresence({
          roomId: 'global',
          userId: client.user.id,
          username: client.user.username,
          status: 'offline',
          lastSeen: new Date(),
        });

        // Nettoyer les rooms
        this.connectedClients.forEach((clients, roomId) => {
          this.removeClientFromRoom(roomId, client.id);
        });
      }
    } catch (error) {
      this.logger.error(`Disconnection error: ${error.message}`);
    }
  }

  @SubscribeMessage('chat:join')
  async handleJoinRoom(client: AuthenticatedSocket, payload: ChatEventPayload) {
    try {
      const { roomId } = payload;
      const canJoin = await this.roomService.canUserJoinRoom(client.user.id, new Types.ObjectId(roomId));

      if (!canJoin) {
        throw new WsException('Not allowed to join this room');
      }

      client.join(roomId);
      this.addClientToRoom(roomId, client.id);

      // Notifier les autres utilisateurs
      this.broadcastPresence({
        roomId,
        userId: client.user.id,
        username: client.user.username,
        status: 'online',
      });

      // Envoyer le nombre d'utilisateurs en ligne
      const onlineUsers = this.getOnlineUsersCount(roomId);
      this.server.to(roomId).emit('chat:online_users', onlineUsers);

    } catch (error) {
      this.logger.error(`Join room error: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('chat:leave')
  async handleLeaveRoom(client: AuthenticatedSocket, payload: ChatEventPayload) {
    try {
      const { roomId } = payload;
      client.leave(roomId);
      this.removeClientFromRoom(roomId, client.id);

      // Notifier les autres utilisateurs
      this.broadcastPresence({
        roomId,
        userId: client.user.id,
        username: client.user.username,
        status: 'offline',
      });

      // Mettre à jour le nombre d'utilisateurs en ligne
      const onlineUsers = this.getOnlineUsersCount(roomId);
      this.server.to(roomId).emit('chat:online_users', onlineUsers);

    } catch (error) {
      this.logger.error(`Leave room error: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('chat:typing')
  handleTyping(client: AuthenticatedSocket, payload: ChatEventPayload) {
    try {
      const { roomId, isTyping } = payload;
      
      const typingPayload: ChatTypingPayload = {
        roomId,
        userId: client.user.id,
        username: client.user.username,
        isTyping,
      };

      // Émettre aux autres utilisateurs de la room
      client.to(roomId).emit('chat:typing', typingPayload);

    } catch (error) {
      this.logger.error(`Typing notification error: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('chat:message')
  async handleMessage(client: AuthenticatedSocket, payload: ChatEventPayload) {
    try {
      const { roomId, content } = payload;
      
      if (!content?.trim()) {
        throw new WsException('Message content cannot be empty');
      }

      // Sauvegarder le message
      const message = await this.chatService.createMessage({
        roomId: new Types.ObjectId(roomId),
        userId: client.user.id,
        content: content.trim(),
      });

      // Émettre le message à tous les utilisateurs de la room
      this.server.to(roomId).emit('chat:message', {
        id: message._id.toString(),
        roomId,
        userId: client.user.id,
        username: client.user.username,
        content: message.content,
        timestamp: message.createdAt?.toISOString(),
        status: 'sent',
        avatar: client.user.avatar,
      });

    } catch (error) {
      this.logger.error(`Message handling error: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  private addClientToRoom(roomId: string, clientId: string) {
    if (!this.connectedClients.has(roomId)) {
      this.connectedClients.set(roomId, new Set());
    }
    this.connectedClients.get(roomId).add(clientId);
  }

  private removeClientFromRoom(roomId: string, clientId: string) {
    const roomClients = this.connectedClients.get(roomId);
    if (roomClients) {
      roomClients.delete(clientId);
      if (roomClients.size === 0) {
        this.connectedClients.delete(roomId);
      }
    }
  }

  private getOnlineUsersCount(roomId: string): number {
    return this.connectedClients.get(roomId)?.size || 0;
  }

  private broadcastPresence(payload: ChatPresencePayload) {
    this.server.emit('chat:presence', payload);
  }
}
