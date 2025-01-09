'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Send, Smile } from 'lucide-react';
import { Button } from '@/components/core/ui/button';
import { Input } from '@/components/core/ui/input';
import { useDebounce } from '@/hooks/useDebounce';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onTyping: () => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, onTyping, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const lastTypingTime = useRef<number>(0);
  const TYPING_TIMER_LENGTH = 3000;
  const debouncedTyping = useDebounce(onTyping, 1000);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (message.trim() && !disabled) {
        onSendMessage(message.trim());
        setMessage('');
        lastTypingTime.current = 0;
      }
    },
    [message, onSendMessage, disabled]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    const currentTime = Date.now();

    if (currentTime - lastTypingTime.current > TYPING_TIMER_LENGTH) {
      lastTypingTime.current = currentTime;
      debouncedTyping();
    }
  };

  return (
    <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <form onSubmit={handleSubmit} className="p-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="flex-none"
            disabled={disabled}
          >
            <Smile className="h-5 w-5" />
          </Button>

          <Input
            type="text"
            placeholder="Écrivez votre message..."
            value={message}
            onChange={handleChange}
            disabled={disabled}
            className="flex-1"
          />

          <Button
            type="submit"
            size="icon"
            disabled={!message.trim() || disabled}
            className="flex-none"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
