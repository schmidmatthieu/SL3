"use client";

import { Room } from '@/types/room';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/events/status-badge';
import { Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRoom } from '@/hooks/useRoom';

interface RoomPreviewProps {
  eventId: string;
  roomId: string;
}

export function RoomPreview({ eventId, roomId }: RoomPreviewProps) {
  const { currentRoom, streamInfo } = useRoom(eventId, roomId);

  if (!currentRoom) return null;

  return (
    <Link href={`/events/${eventId}/rooms/${roomId}`}>
      <Card className="group overflow-hidden">
        <CardContent className="p-0">
          <div className="relative aspect-video">
            <Image
              src={currentRoom.thumbnail}
              alt={currentRoom.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-2 right-2">
              <StatusBadge status={currentRoom.status} />
            </div>
            {currentRoom.status === 'upcoming' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <p className="text-white text-lg font-semibold">Coming Soon</p>
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold truncate">{currentRoom.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <Users className="h-4 w-4" />
              <span>{streamInfo?.viewerCount || currentRoom.participants} participants</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}