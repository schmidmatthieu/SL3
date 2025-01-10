import { io, Socket } from 'socket.io-client';

/**
 * Configuration type for WebSocket connections
 */
interface SocketConfig {
  url: string;
  options?: {
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    autoConnect?: boolean;
    auth?: {
      token?: string;
    };
  };
}

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private config: SocketConfig = {
    url: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001',
    options: {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: false,
    },
  };

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  /**
   * Initialize socket connection with authentication token
   */
  public init(token?: string): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    this.config.options.auth = { token };
    this.socket = io(this.config.url, this.config.options);

    this.socket.on('connect', () => {
      console.log('WebSocket Connected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket Connection Error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket Disconnected:', reason);
    });

    return this.socket;
  }

  /**
   * Get the socket instance
   */
  public getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Disconnect the socket
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Subscribe to an event
   */
  public on<T>(event: string, callback: (data: T) => void): void {
    this.socket?.on(event, callback);
  }

  /**
   * Emit an event
   */
  public emit<T>(event: string, data: T): void {
    this.socket?.emit(event, data);
  }

  /**
   * Remove event listener
   */
  public off(event: string): void {
    this.socket?.off(event);
  }
}

export const socketService = SocketService.getInstance();
