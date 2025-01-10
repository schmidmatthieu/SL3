import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { socketService } from '@/lib/socket';
import { useAuth } from './use-auth';

export const useSocket = () => {
  const { session } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (session?.accessToken) {
      socketRef.current = socketService.init(session.accessToken);
    }

    return () => {
      socketService.disconnect();
    };
  }, [session?.accessToken]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    emit: <T>(event: string, data: T) => socketService.emit(event, data),
    on: <T>(event: string, callback: (data: T) => void) => 
      socketService.on(event, callback),
    off: (event: string) => socketService.off(event),
  };
};
