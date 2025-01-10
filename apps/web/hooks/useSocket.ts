import { useEffect, useRef, useState } from 'react';
import { SocketService } from '@/lib/services/socket.service';
import { useAuthStore } from '@/lib/store/auth-store';

interface UseSocketOptions {
  autoConnect?: boolean;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { autoConnect = true } = options;
  const { token } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const socketService = useRef(SocketService.getInstance());

  useEffect(() => {
    if (autoConnect && token && !isConnected) {
      connectSocket();
    }

    return () => {
      socketService.current.disconnect();
    };
  }, [token, autoConnect]);

  const connectSocket = async () => {
    try {
      if (!token) {
        throw new Error('No authentication token available');
      }

      await socketService.current.connect(token);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect to WebSocket'));
      setIsConnected(false);
    }
  };

  const disconnectSocket = () => {
    socketService.current.disconnect();
    setIsConnected(false);
  };

  const on = (event: string, callback: Function) => {
    socketService.current.on(event, callback);
  };

  const off = (event: string, callback: Function) => {
    socketService.current.off(event, callback);
  };

  const emit = (event: string, data: any) => {
    socketService.current.emit(event, data);
  };

  return {
    isConnected,
    error,
    connect: connectSocket,
    disconnect: disconnectSocket,
    on,
    off,
    emit,
    joinRoom: async (roomId: string) => {
      try {
        await socketService.current.joinRoom(roomId);
      } catch (err) {
        console.error('Failed to join room:', err);
        throw err;
      }
    },
    leaveRoom: async (roomId: string) => {
      try {
        await socketService.current.leaveRoom(roomId);
      } catch (err) {
        console.error('Failed to leave room:', err);
        throw err;
      }
    },
    sendMessage: async (roomId: string, content: string) => {
      try {
        await socketService.current.sendMessage(roomId, content);
      } catch (err) {
        console.error('Failed to send message:', err);
        throw err;
      }
    },
    sendTyping: async (roomId: string, isTyping: boolean) => {
      try {
        await socketService.current.sendTyping(roomId, isTyping);
      } catch (err) {
        console.error('Failed to send typing status:', err);
        throw err;
      }
    },
    markMessageAsRead: async (roomId: string, messageId: string) => {
      try {
        await socketService.current.markMessageAsRead(roomId, messageId);
      } catch (err) {
        console.error('Failed to mark message as read:', err);
        throw err;
      }
    }
  };
}
