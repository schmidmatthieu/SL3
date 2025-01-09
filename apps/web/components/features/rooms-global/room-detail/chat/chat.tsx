'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Users } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useSocket } from '@/hooks/useSocket';
import { ChatMessage, ChatUser } from '@/types/chat';
import { ChatInput } from './chat-input';
import { ChatList } from './chat-list';
import { Alert, AlertDescription } from '@/components/core/ui/alert';
import { Loader2 } from 'lucide-react';

interface ChatProps {
  roomId: string;
}

export function Chat({ roomId }: ChatProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const {
    isConnected,
    error,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,
    markMessageAsRead,
    on,
    off,
  } = useSocket();

  const currentUser: ChatUser = {
    id: user?.id || 'anonymous',
    username: user?.username || 'Anonymous',
    color: '#FF4B4B',
    avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'anonymous'}`,
  };

  useEffect(() => {
    if (isConnected) {
      joinRoom(roomId);

      const handleMessage = (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
        markMessageAsRead(roomId, message.id);
      };

      const handleTyping = (data: { userId: string; roomId: string }) => {
        if (data.roomId === roomId && data.userId !== currentUser.id) {
          setIsTyping(true);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
        }
      };

      const handleOnlineUsers = (count: number) => {
        setOnlineUsers(count);
      };

      on('chat:message', handleMessage);
      on('chat:typing', handleTyping);
      on('chat:online_users', handleOnlineUsers);

      return () => {
        leaveRoom(roomId);
        off('chat:message', handleMessage);
        off('chat:typing', handleTyping);
        off('chat:online_users', handleOnlineUsers);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      };
    }
  }, [roomId, isConnected, currentUser.id]);

  const handleSendMessage = useCallback((content: string) => {
    if (content.trim() && isConnected) {
      sendMessage(roomId, content);
    }
  }, [roomId, isConnected, sendMessage]);

  const handleTyping = useCallback(() => {
    if (isConnected) {
      sendTyping(roomId, true);
    }
  }, [roomId, isConnected, sendTyping]);

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>
          Une erreur est survenue lors de la connexion au chat. Veuillez réessayer plus tard.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-none px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{onlineUsers} en ligne</span>
          </div>
          {isTyping && (
            <span className="text-sm text-muted-foreground animate-pulse">
              Quelqu'un écrit...
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <ChatList messages={messages} />
        </div>
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        disabled={!isConnected}
      />
    </div>
  );
}
