'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Users } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';

import { ChatMessage, ChatUser } from '@/types/chat';
import { ChatInput } from './chat-input';
import { ChatList } from './chat-list';

const generateColor = () => {
  const colors = [
    '#FF4B4B',
    '#FF8000',
    '#FFD700',
    '#00FF00',
    '#00FFFF',
    '#0000FF',
    '#FF00FF',
    '#FF69B4',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

interface ChatProps {
  roomId: string;
}

export function Chat({ roomId }: ChatProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers] = useState(Math.floor(Math.random() * 100) + 50);
  const messageBuffer = useRef<ChatMessage[]>([]);
  const bufferTimeout = useRef<NodeJS.Timeout>();

  const currentUser: ChatUser = {
    id: user?.id || 'anonymous',
    username: user?.username || 'Anonymous',
    color: '#FF4B4B',
    avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'anonymous'}`,
  };

  const addMessageToBuffer = useCallback((message: ChatMessage) => {
    messageBuffer.current.push(message);

    if (bufferTimeout.current) {
      clearTimeout(bufferTimeout.current);
    }

    bufferTimeout.current = setTimeout(() => {
      setMessages(prev => [...prev, ...messageBuffer.current]);
      messageBuffer.current = [];
    }, 500);
  }, []);

  useEffect(() => {
    const mockMessage = (content: string) => ({
      id: Math.random().toString(36).substr(2, 9),
      userId: Math.random().toString(36).substr(2, 9),
      username: `User${Math.floor(Math.random() * 1000)}`,
      color: generateColor(),
      content,
      timestamp: Date.now(),
      status: 'delivered',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
    });

    const interval = setInterval(() => {
      const newMessage = mockMessage(`Message ${Date.now()}`);
      addMessageToBuffer(newMessage);
    }, 5000);

    return () => {
      clearInterval(interval);
      if (bufferTimeout.current) {
        clearTimeout(bufferTimeout.current);
      }
    };
  }, [addMessageToBuffer]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-none px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{onlineUsers} en ligne</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <ChatList messages={messages} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-none border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <ChatInput
          onSendMessage={(content) => {
            const newMessage = {
              id: Math.random().toString(36).substr(2, 9),
              userId: currentUser.id,
              username: currentUser.username,
              color: currentUser.color,
              content,
              timestamp: Date.now(),
              status: 'sent',
              avatar: currentUser.avatar,
            };
            addMessageToBuffer(newMessage);
          }}
        />
      </div>
    </div>
  );
}
