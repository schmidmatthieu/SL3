import { io, Socket } from 'socket.io-client';
import { ChatMessage } from '@/types/chat';

export class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

        this.socket = io(SOCKET_URL, {
          auth: { token },
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
          reconnectionDelay: 1000,
        });

        this.setupEventListeners(resolve, reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  private setupEventListeners(resolve: Function, reject: Function): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket');
      this.reconnectAttempts = 0;
      resolve();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
        reject(new Error('Maximum reconnection attempts reached'));
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket:', reason);
      this.notifyListeners('disconnect', reason);
    });

    // Chat specific events
    this.socket.on('chat:message', (message: ChatMessage) => {
      this.notifyListeners('chat:message', message);
    });

    this.socket.on('chat:typing', (data: { userId: string; roomId: string }) => {
      this.notifyListeners('chat:typing', data);
    });

    this.socket.on('chat:read', (data: { userId: string; messageId: string; roomId: string }) => {
      this.notifyListeners('chat:read', data);
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public emit(event: string, data: any): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.error('Socket not connected. Cannot emit event:', event);
    }
  }

  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  public off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private notifyListeners(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public joinRoom(roomId: string): void {
    this.emit('chat:join', { roomId });
  }

  public leaveRoom(roomId: string): void {
    this.emit('chat:leave', { roomId });
  }

  public sendMessage(roomId: string, content: string): void {
    this.emit('chat:message', { roomId, content });
  }

  public sendTyping(roomId: string, isTyping: boolean): void {
    this.emit('chat:typing', { roomId, isTyping });
  }

  public markMessageAsRead(roomId: string, messageId: string): void {
    this.emit('chat:read', { roomId, messageId });
  }
}
