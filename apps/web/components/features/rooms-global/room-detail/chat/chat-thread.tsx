'use client';

import { useCallback, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { ChatMessage, ChatUser } from '@/types/chat';
import { Button } from '@/components/core/ui/button';
import { ScrollArea } from '@/components/core/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/core/ui/sheet';
import { ChatInput } from './chat-input';
import { ChatList } from './chat-list';
import { useMessages } from '@/hooks/useMessages';

interface ChatThreadProps {
  isOpen: boolean;
  onClose: () => void;
  parentMessage: ChatMessage;
  currentUser: ChatUser;
  roomId: string;
}

export function ChatThread({
  isOpen,
  onClose,
  parentMessage,
  currentUser,
  roomId,
}: ChatThreadProps) {
  const threadId = `${roomId}-${parentMessage.id}`;
  const {
    messages: threadMessages,
    isLoading,
    error,
    addMessage,
    loadMore,
    hasMore,
  } = useMessages({ roomId: threadId, pageSize: 20 });

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (scrollAreaRef.current) {
      const { scrollTop } = scrollAreaRef.current;
      if (scrollTop < 100 && !isLoading && hasMore) {
        loadMore();
      }
    }
  }, [isLoading, hasMore, loadMore]);

  const handleSendReply = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const reply: ChatMessage = {
      id: crypto.randomUUID(),
      content,
      user: currentUser,
      roomId,
      threadId,
      parentId: parentMessage.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addMessage(reply);

    // Émettre l'événement de réponse via WebSocket (à implémenter dans le hook useSocket)
    // socket.emit('chat:reply', reply);
  }, [currentUser, roomId, threadId, parentMessage.id, addMessage]);

  useEffect(() => {
    if (isOpen && lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={() => onClose()}>
      <SheetContent side="right" className="w-full sm:w-[400px] p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-4 py-2 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle>Réponses</SheetTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 flex flex-col min-h-0">
            <ScrollArea
              ref={scrollAreaRef}
              className="flex-1 p-4"
              onScroll={handleScroll}
            >
              {/* Message parent */}
              <div className="mb-6">
                <ChatList
                  messages={[parentMessage]}
                  currentUser={currentUser}
                />
                <div className="ml-12 mt-2 border-l-2 pl-4 text-sm text-muted-foreground">
                  {threadMessages.length} réponses
                </div>
              </div>

              {/* Réponses */}
              <ChatList
                messages={threadMessages}
                currentUser={currentUser}
                lastMessageRef={lastMessageRef}
              />
            </ScrollArea>

            <div className="p-4 border-t">
              <ChatInput
                onSend={handleSendReply}
                onTyping={() => {}}
                placeholder="Répondre au message..."
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
