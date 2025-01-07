'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useEventStore } from '@/lib/store/event.store';

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
  const eventId = propsEventId || (params?.eventId as string);
  const roomId = propsRoomId || (params?.roomId as string);

  const { currentEvent, isLoading, error, fetchEvent } = useEventStore();
  const [retryCount, setRetryCount] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!eventId || eventId === 'undefined') {
        const errorMessage = `ID de l'événement invalide: ${eventId}`;
        console.error(errorMessage, { eventId, params });
        setLocalError(errorMessage);
        return;
      }

      if (!roomId || roomId === 'undefined') {
        const errorMessage = `ID de la salle invalide: ${roomId}`;
        console.error(errorMessage, { roomId, params });
        setLocalError(errorMessage);
        return;
      }

      try {
        console.log('Chargement de la salle:', { eventId, roomId, params });
        await fetchEvent(eventId);
        setLocalError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement de la salle';
        console.error('Erreur dans le chargement:', err);
        setLocalError(errorMessage);
      }
    };

    init();
  }, [eventId, roomId, fetchEvent, retryCount, params]);

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
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            {localError}
          </AlertDescription>
        </Alert>
        <div className="flex gap-4">
          <Button onClick={handleRetry} variant="default">
            Réessayer
          </Button>
          <Button onClick={handleNavigateToEvents} variant="outline">
            Retour aux événements
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Erreur de chargement</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <div className="flex gap-4">
          <Button onClick={handleRetry} variant="default">
            Réessayer
          </Button>
          <Button onClick={handleBack} variant="outline">
            Retour
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <Skeleton className="aspect-video w-full" />
          </div>
          <div>
            <Skeleton className="h-[400px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="container py-8">
        <Alert variant="default" className="mb-4">
          <AlertTitle>Événement non trouvé</AlertTitle>
          <AlertDescription>
            L'événement demandé n'a pas été trouvé. Veuillez vérifier l'URL ou retourner à la liste des événements.
          </AlertDescription>
        </Alert>
        <Button onClick={handleNavigateToEvents} variant="outline">
          Retour aux événements
        </Button>
      </div>
    );
  }

  return <RoomDetails event={currentEvent} roomId={roomId} />;
}
