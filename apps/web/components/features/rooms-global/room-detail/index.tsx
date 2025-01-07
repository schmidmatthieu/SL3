'use client';

import { useTranslation } from 'react-i18next';
import { useRoom } from '@/hooks/useRoom';
import { Event } from '@/types/event';
import { Skeleton } from '@/components/core/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/core/ui/alert';
import { Button } from '@/components/core/ui/button';
import { Badge } from '@/components/core/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/core/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/ui/card';
import { CalendarIcon, UsersIcon, VideoIcon } from 'lucide-react';

interface RoomDetailsProps {
  event: Event;
  roomId: string;
}

export function RoomDetails({ event, roomId }: RoomDetailsProps) {
  const { t } = useTranslation('room');
  const { currentRoom, isLoading, error, streamInfo } = useRoom(event.id, roomId);

  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>{t('error.title')}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading || !currentRoom) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-6">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  const isLive = currentRoom.status === 'live';

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{currentRoom.name}</h1>
        {isLive && (
          <Badge variant="destructive" className="animate-pulse">
            {t('status.live')}
          </Badge>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-6">
          {isLive && streamInfo?.streamUrl ? (
            <div className="aspect-video w-full bg-background rounded-lg overflow-hidden">
              <iframe
                src={streamInfo.streamUrl}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
              <VideoIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{t('description.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {currentRoom.description}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('info.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <span>{new Date(currentRoom.startTime).toLocaleString()}</span>
              </div>
              {isLive && streamInfo && (
                <div className="flex items-center space-x-4">
                  <UsersIcon className="h-5 w-5 text-muted-foreground" />
                  <span>
                    {t('info.viewers', { count: streamInfo.viewerCount })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {currentRoom.speakers && currentRoom.speakers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('speakers.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentRoom.speakers.map((speaker) => (
                  <div key={speaker.id} className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={speaker.avatarUrl} alt={speaker.name} />
                      <AvatarFallback>
                        {speaker.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{speaker.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {speaker.role}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
