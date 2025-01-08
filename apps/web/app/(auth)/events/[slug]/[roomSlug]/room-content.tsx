'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useEventStore } from '@/lib/store/event.store';
import { useRoom } from '@/hooks/useRoom';

import { Button } from '@/components/core/ui/button';
import { Skeleton } from '@/components/core/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/core/ui/alert';
import { RoomDetails } from '@/components/features/rooms-global/room-detail/room-details';

interface RoomContentProps {
  eventId?: string;
  roomId?: string;
}

export function RoomContent({ eventId: propsEventId, roomId: propsRoomId }: RoomContentProps) {
  const router = useRouter();
  const params = useParams();
  const eventSlug = params?.slug as string;
  const roomSlug = params?.roomSlug as string;

  const { currentEvent, isLoading: isEventLoading, error: eventError } = useEventStore();
  const { currentRoom, isLoading: isRoomLoading, error: roomError } = useRoom(eventSlug, roomSlug);

  const [retryCount, setRetryCount] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);

  const isLoading = isEventLoading || isRoomLoading;
  const error = eventError || roomError || localError;

  useEffect(() => {
    if (!eventSlug || eventSlug === 'undefined') {
      setLocalError('Invalid event identifier');
      return;
    }

    if (!roomSlug || roomSlug === 'undefined') {
      setLocalError('Invalid room identifier');
      return;
    }

    // Reset local error if we have valid slugs
    setLocalError(null);
  }, [eventSlug, roomSlug]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setLocalError(null);
  };

  const handleBack = () => {
    router.back();
  };

  const handleNavigateToEvents = () => {
    router.push('/events');
  };

  if (localError) {
    return (
      <div className="container py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {localError}
          </AlertDescription>
        </Alert>
        <div className="flex gap-4">
          <Button onClick={handleRetry} variant="default">
            Retry
          </Button>
          <Button onClick={handleNavigateToEvents} variant="outline">
            Back to events
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Loading Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <div className="flex gap-4">
          <Button onClick={handleRetry} variant="default">
            Retry
          </Button>
          <Button onClick={handleBack} variant="outline">
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="container py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Room not found
          </AlertDescription>
        </Alert>
        <Button onClick={handleBack} variant="outline">
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <RoomDetails room={currentRoom} />
    </div>
  );
}
