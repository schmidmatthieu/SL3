"use client";

import { ChatMessage } from '@/types/chat';
import { memo } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, CheckCheck } from 'lucide-react';

interface MessageProps {
  message: ChatMessage;
  showAvatar?: boolean;
}

function MessageComponent({ message, showAvatar = true }: MessageProps) {
  const formattedTime = format(message.timestamp, 'HH:mm');

  const renderContent = () => {
    if (!message.emotes?.length) {
      return message.content;
    }

    const sortedEmotes = [...message.emotes].sort((a, b) => {
      return a.positions[0][0] - b.positions[0][0];
    });

    let lastIndex = 0;
    const parts: JSX.Element[] = [];

    sortedEmotes.forEach((emote, index) => {
      const [start, end] = emote.positions[0];

      if (start > lastIndex) {
        parts.push(
          <span key={`text-${index}`}>
            {message.content.slice(lastIndex, start)}
          </span>
        );
      }

      parts.push(
        <img
          key={`emote-${index}`}
          src={`https://static-cdn.jtvnw.net/emoticons/v2/${emote.id}/default/dark/1.0`}
          alt={emote.name}
          className="inline-block h-5 w-5 -mt-1"
        />
      );

      lastIndex = end + 1;
    });

    if (lastIndex < message.content.length) {
      parts.push(
        <span key="text-end">
          {message.content.slice(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  return (
    <div className="flex items-start gap-3 py-2 px-2 hover:bg-muted/50 rounded-lg group transition-colors">
      {showAvatar ? (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={message.avatar} />
          <AvatarFallback>{message.username[0]}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-8" />
      )}
      <div className="flex-1 min-w-0">
        {showAvatar && (
          <div className="flex items-baseline gap-2 mb-1">
            <span style={{ color: message.color }} className="font-medium">
              {message.username}
            </span>
            <span className="text-xs text-muted-foreground">
              {formattedTime}
            </span>
          </div>
        )}
        <div className="flex items-end gap-2">
          <p className="break-words">{renderContent()}</p>
          <div className="shrink-0 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            {message.status === 'sending' ? (
              <Check className="h-3 w-3" />
            ) : (
              <CheckCheck className="h-3 w-3" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const Message = memo(MessageComponent);