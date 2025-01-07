'use client';

import { MessageCircle, Video } from 'lucide-react';
import { Badge } from '@/components/core/ui/badge';
import { RoomStatusBadge } from '@/components/features/rooms-global/room-detail/room-status-badge';
import { Room } from '@/types/room';

interface RoomBadgesProps {
  room: Room;
}

export function RoomBadges({ room }: RoomBadgesProps) {
  return (
    <div className="mt-2 flex items-center gap-2">
      <RoomStatusBadge status={room.status} />
      {room.settings?.chatEnabled && (
        <Badge
          variant="outline"
          className="text-xs bg-muted/30 text-primary hover:bg-muted/40 dark:bg-muted/80 dark:text-primary dark:hover:bg-muted/90"
        >
          <MessageCircle className="w-3 h-3 mr-1" />
          CHAT
        </Badge>
      )}
      {room.settings?.recordingEnabled && (
        <Badge
          variant="outline"
          className="text-xs bg-muted/30 text-primary hover:bg-muted/40 dark:bg-muted/80 dark:text-primary dark:hover:bg-muted/90"
        >
          <Video className="w-3 h-3 mr-1" />
          REC
        </Badge>
      )}
    </div>
  );
}
