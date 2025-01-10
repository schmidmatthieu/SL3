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
        const WS_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const WS_PATH = process.env.NEXT_PUBLIC_WS_PATH || '/socket.io';
        const WS_NAMESPACE = process.env.NEXT_PUBLIC_WS_NAMESPACE;
        
        if (!WS_URL) {
          throw new Error('NEXT_PUBLIC_API_URL is not defined');
        }

        // Construire l'URL complète du WebSocket
        const socketUrl = `${WS_URL}${WS_NAMESPACE ? `/${WS_NAMESPACE}` : ''}`;
        console.log('Connecting to WebSocket:', socketUrl);

        if (this.socket?.connected) {
          console.log('Socket already connected');
          resolve();
          return;
        }

        this.socket = io(socketUrl, {
          auth: { token },
          path: WS_PATH,
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
          reconnectionDelay: 1000,
          timeout: 20000,
          forceNew: false,
        });

        this.setupEventListeners(resolve, reject);
      } catch (error) {
        console.error('Error initializing socket:', error);
        reject(error);
      }
    });
  }

  private setupEventListeners(resolve: Function, reject: Function): void {
    if (!this.socket) {
      console.error('Socket instance is null');
      reject(new Error('Socket instance is null'));
      return;
    }

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server with ID:', this.socket?.id);
      this.reconnectAttempts = 0;
      resolve();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
        const error = new Error(`Maximum reconnection attempts reached (${this.MAX_RECONNECT_ATTEMPTS})`);
        console.error(error);
        reject(error);
      }
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.notifyListeners('error', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket:', reason);
      this.notifyListeners('disconnect', reason);
    });

    // Chat specific events with rate limiting
    const MESSAGE_LIMIT = parseInt(process.env.NEXT_PUBLIC_CHAT_MESSAGE_LIMIT || '50', 10);
    const RATE_LIMIT = parseInt(process.env.NEXT_PUBLIC_CHAT_RATE_LIMIT || '5', 10);
    let messageCount = 0;
    let lastMessageTime = Date.now();

    this.socket.on('chat:message', (message: ChatMessage) => {
      const now = Date.now();
      if (now - lastMessageTime >= 1000) {
        messageCount = 0;
        lastMessageTime = now;
      }

      if (messageCount < RATE_LIMIT) {
        this.notifyListeners('chat:message', message);
        messageCount++;
      } else {
        console.warn('Message rate limit exceeded');
      }
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

  public joinRoom(roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('chat:join', { roomId }, (response: any) => {
        if (response?.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  public leaveRoom(roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('chat:leave', { roomId }, (response: any) => {
        if (response?.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  public sendMessage(roomId: string, content: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('chat:message', { roomId, content }, (response: any) => {
        if (response?.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  public sendTyping(roomId: string, isTyping: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('chat:typing', { roomId, isTyping }, (response: any) => {
        if (response?.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  public markMessageAsRead(roomId: string, messageId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit('chat:read', { roomId, messageId }, (response: any) => {
        if (response?.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }
}
