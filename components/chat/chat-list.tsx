"use client";

import { forwardRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChatMessage } from '@/types/chat';
import { Message } from '@/components/chat/message';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatListProps {
  messages: ChatMessage[];
}

export const ChatList = forwardRef<HTMLDivElement, ChatListProps>(
  function ChatList({ messages }, ref) {
    const virtualizer = useVirtualizer({
      count: messages.length,
      getScrollElement: () => ref.current,
      estimateSize: useCallback(() => 64, []), // Increased height for new message layout
      overscan: 5,
    });

    return (
      <ScrollArea 
        ref={ref} 
        className="flex-1 px-2"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => (
            <div
              key={messages[virtualItem.index].id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <Message 
                message={messages[virtualItem.index]}
                showAvatar={
                  virtualItem.index === 0 || 
                  messages[virtualItem.index].userId !== messages[virtualItem.index - 1]?.userId
                }
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  }
);