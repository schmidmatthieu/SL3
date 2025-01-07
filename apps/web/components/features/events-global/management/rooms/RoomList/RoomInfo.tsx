'use client';

import { Room } from '@/types/room';
import { RoomBadges } from './RoomBadges';

interface RoomInfoProps {
  room: Room;
}

export function RoomInfo({ room }: RoomInfoProps) {
  return (
    <div className="flex items-center space-x-4">
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted/20">
        <img
          src={room.thumbnail || '/placeholder.jpg'}
          alt={room.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <h3 className="font-medium text-foreground">{room.name}</h3>
        <p className="text-sm text-muted-foreground">{room.description}</p>
        <RoomBadges room={room} />
      </div>
    </div>
  );
}
