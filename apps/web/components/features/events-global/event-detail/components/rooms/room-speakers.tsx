'use client';

import { useTranslation } from 'react-i18next';
import { Mic } from 'lucide-react';
import Image from 'next/image';

import { Speaker } from '@/types/speaker';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/core/ui/avatar';
import { Badge } from '@/components/core/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/core/ui/tooltip';
import { useRoomSpeakers } from '@/hooks/use-room-speakers';

interface RoomSpeakersProps {
  speakerIds?: string[];
  eventId: string;
  maxDisplayed?: number;
}

export function RoomSpeakers({ speakerIds, eventId, maxDisplayed = 3 }: RoomSpeakersProps) {
  const { t } = useTranslation('components/event-detail');
  const { speakers, isLoading } = useRoomSpeakers(eventId, speakerIds);

  if (isLoading || !speakers || speakers.length === 0) {
    return null;
  }

  const displayedSpeakers = speakers.slice(0, maxDisplayed);
  const remainingSpeakers = speakers.length - maxDisplayed;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted/50">
        <Mic className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {displayedSpeakers.map((speaker) => (
              <TooltipProvider key={speaker.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="w-6 h-6 border-2 border-background hover:translate-y-[-2px] transition-transform">
                      <AvatarImage
                        src={speaker.imageUrl}
                        alt={`${speaker.firstName} ${speaker.lastName}`}
                      />
                      <AvatarFallback>
                        {speaker.firstName?.[0]}
                        {speaker.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {speaker.firstName} {speaker.lastName}
                      {speaker.role && ` - ${speaker.role}`}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            {remainingSpeakers > 0 && (
              <Badge variant="secondary" className="text-xs">
                +{remainingSpeakers}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
