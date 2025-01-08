'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

import { ChatMessage } from '@/types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/core/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/core/ui/tooltip';

interface MessageProps {
  message: ChatMessage;
  showAvatar: boolean;
  isSequential?: boolean;
}

export function Message({ message, showAvatar, isSequential }: MessageProps) {
  const formattedTime = format(new Date(message.timestamp), 'HH:mm', { locale: fr });
  const formattedDate = format(new Date(message.timestamp), 'PPP', { locale: fr });

  return (
    <div 
      className={cn(
        'flex items-start gap-3 min-h-[32px]',
        isSequential ? 'mt-0.5' : 'mt-3',
        !showAvatar && 'pl-12'
      )}
    >
      <div className="w-9 shrink-0">
        {showAvatar && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-9 w-9 select-none">
                  <AvatarImage src={message.avatar} />
                  <AvatarFallback 
                    style={{ backgroundColor: message.color }}
                    className="text-primary-foreground font-medium"
                  >
                    {message.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="left" align="center">
                <p>{message.username}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {showAvatar && (
          <div className="flex items-baseline gap-2 mb-1">
            <span 
              className="text-sm font-semibold hover:underline cursor-pointer" 
              style={{ color: message.color }}
            >
              {message.username}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs text-muted-foreground select-none">
                    {formattedTime}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                  <p>{formattedDate}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        <div className="flex items-end gap-2 group">
          <div 
            className={cn(
              "rounded-xl px-4 py-2 text-sm break-words",
              "bg-muted/50 hover:bg-muted/80 transition-colors",
              "max-w-[85%] whitespace-pre-wrap"
            )}
          >
            {message.content}
          </div>

          <div className={cn(
            "flex items-center gap-2 shrink-0",
            "text-xs text-muted-foreground",
            "opacity-0 group-hover:opacity-100 transition-opacity"
          )}>
            {!showAvatar && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="select-none">{formattedTime}</span>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    <p>{formattedDate}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {message.status && (
              <span>
                {message.status === 'sent' ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <CheckCheck className="h-3 w-3" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
