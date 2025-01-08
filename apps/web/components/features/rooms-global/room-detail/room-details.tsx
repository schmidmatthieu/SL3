'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Room } from '@/types/room';
import { Button } from '@/components/core/ui/button';
import { Card, CardContent } from '@/components/core/ui/card';
import { Separator } from '@/components/core/ui/separator';
import { Badge } from '@/components/core/ui/badge';
import { ScrollArea } from '@/components/core/ui/scroll-area';
import { Chat } from '@/components/features/rooms-global/room-detail/chat/chat';
import { RoomStatusBadge } from '@/components/features/rooms-global/room-detail/room-status-badge';
import { RoomTabs } from './room-tabs';

interface RoomDetailsProps {
  room: Room;
}

export function RoomDetails({ room }: RoomDetailsProps) {
  const viewerCount = room.status === 'live' ? Math.floor(Math.random() * 100) + 50 : 0;
  const startTime = room.startTime ? new Date(room.startTime) : null;
  const endTime = room.endTime ? new Date(room.endTime) : null;

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
              <Link href={`/events/${room.eventSlug}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <RoomStatusBadge status={room.status} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{room.name}</h1>
          <p className="text-muted-foreground max-w-2xl">{room.description}</p>
        </div>
        
        {room.status === 'live' && (
          <Badge variant="secondary" className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>{viewerCount} spectateurs</span>
          </Badge>
        )}
      </div>

      <Separator />

      {/* Main Content */}
      <div className="grid gap-3 lg:grid-cols-3 xl:grid-cols-4">
        {/* Left Column - Stream/Cover & Info */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-3">
          {/* Stream/Cover Section */}
          <Card>
            <CardContent className="p-0">
              {room.status === 'live' && room.streamUrl ? (
                <div className="relative aspect-video">
                  <iframe
                    src={room.streamUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full rounded-t-lg border-0 bg-muted"
                  />
                </div>
              ) : (
                <div className="relative aspect-video">
                  {room.coverImage ? (
                    <Image
                      src={room.coverImage}
                      alt={room.name}
                      fill
                      className="object-cover rounded-t-lg"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-t-lg">
                      <p className="text-muted-foreground">Aucun stream disponible</p>
                    </div>
                  )}
                </div>
              )}

              {/* Room Info */}
              <div className="p-6 space-y-4">
                {(startTime || endTime) && (
                  <div className="flex flex-wrap gap-4">
                    {startTime && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {format(startTime, 'PPP', { locale: fr })}
                        </span>
                      </div>
                    )}
                    {startTime && endTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {room.tags && room.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {room.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs Section */}
          <Card>
            <CardContent className="p-6">
              <RoomTabs room={room} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Chat */}
        <div className="lg:col-span-1">
          <Card className="h-[calc(75vh)] overflow-hidden">
            <CardContent className="p-0 h-full">
              <Chat roomId={room._id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
