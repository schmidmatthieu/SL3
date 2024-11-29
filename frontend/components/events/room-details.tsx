"use client";

import { Event } from '@/types/event';
import { Room } from '@/types/room';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/events/status-badge';
import { Chat } from '@/components/chat/chat';
import { RoomTabs } from '@/components/room/room-tabs';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface RoomDetailsProps {
  event: Event;
  room: Room;
}

export function RoomDetails({ event, room }: RoomDetailsProps) {
  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/events/${event.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{room.title}</h1>
          <p className="text-muted-foreground">{event.title}</p>
        </div>
        <StatusBadge status={room.status} />
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={room.thumbnail}
              alt={room.title}
              fill
              className="object-cover"
            />
          </div>
          
          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <div className="text-sm">
              <p className="font-medium">Schedule</p>
              <p className="text-muted-foreground">
                {room.startTime} - {room.endTime}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{room.participants} participants</span>
            </div>
          </div>

          <RoomTabs roomId={room.id} />
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6 h-[calc(100vh-12rem)]">
            <Chat
              roomId={room.id}
              currentUser={{
                id: '1',
                username: 'Demo User',
                color: '#FF4B4B'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}