'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';

import { Event } from '@/types/event';
import { useRoom } from '@/hooks/useRoom';
import { Button } from '@/components/core/ui/button';
import { Skeleton } from '@/components/core/ui/skeleton';
import { Chat } from '@/components/features/rooms-global/room-detail/chat/chat';
import { StatusBadge } from '@/components/features/events-global/status-badge';
import { RoomTabs } from './room-tabs';

interface RoomDetailsProps {
  event: Event;
  roomId: string;
}

export function RoomDetails({ event, roomId }: RoomDetailsProps) {

  const { currentRoom, isLoading, streamInfo } = useRoom(event._id, roomId);

  if (!event.rooms) {
    return (
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/events/${event._id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">No Rooms Available</h2>
            <p className="text-muted-foreground">This event doesn't have any rooms yet.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !currentRoom) {
    return (
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/events/${event._id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <Skeleton className="aspect-video w-full" />
          </div>
          <div>
            <Skeleton className="h-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  const thumbnailUrl = currentRoom.thumbnail || '/placeholder-room.jpg';

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/events/${event._id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{currentRoom.title}</h1>
          <p className="text-muted-foreground">{event.title}</p>
        </div>
        <StatusBadge status={currentRoom.status} />
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-4">
          {currentRoom.status === 'live' && streamInfo?.streamUrl ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              {/* Le VideoPlayer sera implémenté dans la prochaine étape */}
              <Image src={thumbnailUrl} alt={currentRoom.title} fill className="object-cover" />
            </div>
          ) : (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image src={thumbnailUrl} alt={currentRoom.title} fill className="object-cover" />
              {currentRoom.status === 'upcoming' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <p className="text-white text-xl font-semibold">Coming Soon</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <div className="text-sm">
              <p className="font-medium">Schedule</p>
              <p className="text-muted-foreground">
                {currentRoom.startTime} - {currentRoom.endTime}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{streamInfo?.viewerCount || currentRoom.participants} participants</span>
            </div>
          </div>

          <RoomTabs roomId={currentRoom.id} />
        </div>

        <div>
          <Chat roomId={currentRoom.id} />
        </div>
      </div>
    </div>
  );
}
