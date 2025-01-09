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

  const joinRoom = (roomId: string) => {
    socketService.current.joinRoom(roomId);
  };

  const leaveRoom = (roomId: string) => {
    socketService.current.leaveRoom(roomId);
  };

  const sendMessage = (roomId: string, content: string) => {
    socketService.current.sendMessage(roomId, content);
  };

  const sendTyping = (roomId: string, isTyping: boolean) => {
    socketService.current.sendTyping(roomId, isTyping);
  };

  const markMessageAsRead = (roomId: string, messageId: string) => {
    socketService.current.markMessageAsRead(roomId, messageId);
  };

  return {
    isConnected,
    error,
    connect: connectSocket,
    disconnect: disconnectSocket,
    on,
    off,
    emit,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,
    markMessageAsRead,
  };
}
