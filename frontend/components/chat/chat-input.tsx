"use client";

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Smile } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  }, [message, onSendMessage, disabled]);

  return (
    <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-center gap-2">
          <Button 
            type="button" 
            size="icon" 
            variant="ghost" 
            className="shrink-0"
            disabled={disabled}
          >
            <Smile className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={disabled ? "Sign in to chat" : "Send a message"}
            disabled={disabled}
            className="flex-1 bg-muted/50"
          />
          <Button 
            type="submit" 
            size="icon"
            className="shrink-0"
            disabled={disabled || !message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}