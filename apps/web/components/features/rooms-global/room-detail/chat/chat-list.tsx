'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

import { ChatMessage } from '@/types/chat';
import { Message } from './message';

interface ChatListProps {
  messages: ChatMessage[];
}

export function ChatList({ messages }: ChatListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const isAutoScrolling = useRef(false);
  const shouldAutoScroll = useRef(true);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!parentRef.current || isAutoScrolling.current) return;

    const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    shouldAutoScroll.current = distanceFromBottom < 100;
  }, []);

  const scrollToBottom = useCallback((force = false) => {
    if (!parentRef.current || (!shouldAutoScroll.current && !force)) return;

    isAutoScrolling.current = true;
    requestAnimationFrame(() => {
      if (lastMessageRef.current) {
        lastMessageRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      }
      setTimeout(() => {
        isAutoScrolling.current = false;
      }, 100);
    });
  }, []);

  useEffect(() => {
    scrollToBottom(messages.length <= 1);
  }, [messages.length, scrollToBottom]);

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: useCallback(() => parentRef.current, []),
    estimateSize: useCallback(() => 64, []),
    overscan: 5,
  });

  return (
    <div 
      ref={parentRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto px-2"
    >
      <div className="py-3">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem, index) => {
            const message = messages[virtualItem.index];
            const showAvatar = virtualItem.index === 0 || 
              messages[virtualItem.index].userId !== messages[virtualItem.index - 1]?.userId;
            const isLastMessage = virtualItem.index === messages.length - 1;

            return (
              <div
                key={message.id}
                ref={isLastMessage ? lastMessageRef : undefined}
                data-index={virtualItem.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <Message
                  message={message}
                  showAvatar={showAvatar}
                  isSequential={!showAvatar}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
