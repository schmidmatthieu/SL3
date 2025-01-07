'use client';

import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Room } from '@/types/room';
import { RoomInfo } from './RoomInfo';
import { RoomControls } from '../RoomControls';

interface RoomCardProps {
  room: Room;
  onStreamControl: (roomId: string | undefined, action: 'start' | 'pause' | 'stop' | 'end') => Promise<void>;
  onStatusChange: (roomId: string | undefined, status: RoomStatus) => Promise<void>;
  onDelete: (roomId: string | undefined) => Promise<void>;
}

export function RoomCard({
  room,
  onStreamControl,
  onStatusChange,
  onDelete,
}: RoomCardProps) {
  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMM yyyy HH:mm');
  };

  return (
    <div
      className={cn(
        'rounded-lg p-4 border transition-colors',
        'bg-card text-card-foreground',
        'hover:bg-accent/5',
        'dark:hover:bg-accent/10'
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <RoomInfo room={room} />
        <div className="flex items-center gap-6">
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground" />
              {formatDate(room.startTime)}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
              {formatDate(room.endTime)}
            </div>
          </div>
          <RoomControls
            room={room}
            onStreamControl={onStreamControl}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        </div>
      </div>
    </div>
  );
}
