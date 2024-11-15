"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage, ChatUser } from '@/types/chat';
import { ChatList } from '@/components/chat/chat-list';
import { ChatInput } from '@/components/chat/chat-input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

const generateColor = () => {
  const colors = [
    '#FF4B4B', '#FF8000', '#FFD700', '#00FF00',
    '#00FFFF', '#0000FF', '#FF00FF', '#FF69B4'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

interface ChatProps {
  roomId: string;
  currentUser?: ChatUser;
}

export function Chat({ roomId, currentUser }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers] = useState(Math.floor(Math.random() * 100) + 50);
  const messageBuffer = useRef<ChatMessage[]>([]);
  const bufferTimeout = useRef<NodeJS.Timeout>();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mockMessage = (content: string) => ({
      id: Math.random().toString(36).substr(2, 9),
      userId: Math.random().toString(36).substr(2, 9),
      username: `User${Math.floor(Math.random() * 1000)}`,
      color: generateColor(),
      content,
      timestamp: Date.now(),
      status: 'delivered',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`
    });

    const interval = setInterval(() => {
      const newMessage = mockMessage(`Message ${Date.now()}`);
      addMessageToBuffer(newMessage);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const addMessageToBuffer = useCallback((message: ChatMessage) => {
    messageBuffer.current.push(message);

    if (bufferTimeout.current) {
      clearTimeout(bufferTimeout.current);
    }

    bufferTimeout.current = setTimeout(() => {
      setMessages(prev => [...prev, ...messageBuffer.current]);
      messageBuffer.current = [];
      
      // Auto-scroll to bottom
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: 'smooth'
        });
      });
    }, 100);
  }, []);

  const handleSendMessage = useCallback((content: string) => {
    if (!currentUser) return;

    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      username: currentUser.username,
      color: currentUser.color,
      content,
      timestamp: Date.now(),
      status: 'sending',
      avatar: currentUser.avatar
    };

    addMessageToBuffer(newMessage);

    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'delivered' } 
            : msg
        )
      );
    }, 1000);
  }, [currentUser]);

  return (
    <Card className="flex flex-col h-full border-none shadow-none bg-card/50">
      <CardHeader className="py-3 px-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Live Chat</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{onlineUsers} online</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 min-h-0">
        <div className="flex flex-col h-full">
          <ChatList ref={listRef} messages={messages} />
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={!currentUser}
          />
        </div>
      </CardContent>
    </Card>
  );
}