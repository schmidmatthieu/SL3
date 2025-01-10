'use client';

import { memo, useState } from 'react';
import { ChatMessage, ChatUser } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/core/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Reply, MessageSquare } from 'lucide-react';
import { Button } from '@/components/core/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/core/ui/dropdown-menu';
import { ChatThread } from './chat-thread';

interface ChatListProps {
  messages: ChatMessage[];
  currentUser: ChatUser;
  lastMessageRef?: React.RefObject<HTMLDivElement>;
  onEditMessage?: (messageId: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}

export const ChatList = memo(function ChatList({ 
  messages, 
  currentUser,
  lastMessageRef,
  onEditMessage,
  onDeleteMessage,
}: ChatListProps) {
  const [activeThread, setActiveThread] = useState<ChatMessage | null>(null);

  const formatMessageTime = (date: string | Date) => {
    return format(new Date(date), 'HH:mm', { locale: fr });
  };

  const handleOpenThread = (message: ChatMessage) => {
    setActiveThread(message);
  };

  const handleCloseThread = () => {
    setActiveThread(null);
  };

  const renderMessageActions = (message: ChatMessage) => {
    const isOwnMessage = message.user.id === currentUser.id;

    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => handleOpenThread(message)}
        >
          <Reply className="h-4 w-4" />
        </Button>

        {isOwnMessage && onEditMessage && onDeleteMessage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="sr-only">Actions</span>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                >
                  <path
                    d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditMessage(message.id)}>
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDeleteMessage(message.id)}
              >
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  };

  const renderMessage = (message: ChatMessage, isLast: boolean) => {
    const isCurrentUser = message.user.id === currentUser.id;

    return (
      <div
        key={message.id}
        ref={isLast ? lastMessageRef : undefined}
        className={cn(
          "group flex gap-3 mb-4",
          isCurrentUser && "flex-row-reverse"
        )}
      >
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.user.avatar} alt={message.user.username} />
          <AvatarFallback>
            {message.user.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className={cn(
          "flex flex-col max-w-[80%]",
          isCurrentUser && "items-end"
        )}>
          <div className="flex items-center gap-2 mb-1">
            <span 
              className="text-sm font-medium"
              style={{ color: message.user.color }}
            >
              {message.user.username}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatMessageTime(message.createdAt)}
            </span>
          </div>

          <div className="flex items-start gap-2">
            <div className={cn(
              "rounded-lg px-3 py-2",
              isCurrentUser 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted"
            )}>
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
              {message.edited && (
                <span className="text-xs text-muted-foreground ml-2">
                  (modifié)
                </span>
              )}
            </div>

            {renderMessageActions(message)}
          </div>

          {message.replyCount && message.replyCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 h-6 text-xs gap-1"
              onClick={() => handleOpenThread(message)}
            >
              <MessageSquare className="h-3 w-3" />
              {message.replyCount} réponse{message.replyCount > 1 ? 's' : ''}
            </Button>
          )}

          {message.deletedAt && (
            <span className="text-xs text-muted-foreground mt-1">
              Message supprimé
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-4">
        {messages.map((message, index) => 
          renderMessage(message, index === messages.length - 1)
        )}
      </div>

      {activeThread && (
        <ChatThread
          isOpen={true}
          onClose={handleCloseThread}
          parentMessage={activeThread}
          currentUser={currentUser}
          roomId={activeThread.roomId}
        />
      )}
    </>
  );
});
