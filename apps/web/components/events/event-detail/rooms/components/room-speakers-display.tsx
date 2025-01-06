'use client';

import { useTranslation } from 'react-i18next';
import { Mic } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useRoomSpeakers } from '@/hooks/use-room-speakers';
import { cn } from '@/lib/utils';

interface RoomSpeakersDisplayProps {
  speakerIds?: string[];
  eventId: string;
  className?: string;
}

export function RoomSpeakersDisplay({ 
  speakerIds, 
  eventId,
  className 
}: RoomSpeakersDisplayProps) {
  const { t } = useTranslation('components/event-detail');
  const { speakers, isLoading } = useRoomSpeakers(eventId, speakerIds);

  console.log('RoomSpeakersDisplay:', {
    eventId,
    speakerIds,
    isLoading,
    speakers
  });

  if (isLoading || !speakers?.length) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted/50">
        <Mic className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center">
            <div className="flex -space-x-3 hover:space-x-1 transition-all duration-200">
              {speakers.map((speaker, index) => (
                <TooltipProvider key={speaker.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar 
                        className={cn(
                          "w-8 h-8 border-2 border-background",
                          "transition-all duration-200",
                          "hover:scale-110 hover:z-10",
                          "group-hover:[&:not(:hover)]:-translate-x-1"
                        )}
                        style={{
                          zIndex: speakers.length - index,
                        }}
                      >
                        <AvatarImage
                          src={speaker.imageUrl}
                          alt={`${speaker.firstName} ${speaker.lastName}`}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {speaker.firstName?.[0]}
                          {speaker.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-sm">
                        <p className="font-medium">
                          {speaker.firstName} {speaker.lastName}
                        </p>
                        {speaker.role && (
                          <p className="text-muted-foreground text-xs">
                            {speaker.role}
                            {speaker.company && ` - ${speaker.company}`}
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('rooms.speakersCount', { 
              count: speakers.length,
              defaultValue: '{{count}} speaker',
              defaultValue_plural: '{{count}} speakers'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
