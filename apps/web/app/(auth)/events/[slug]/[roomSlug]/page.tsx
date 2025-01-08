'use client';

import { Suspense, use } from 'react';
import { useParams } from 'next/navigation';

import { Skeleton } from '@/components/core/ui/skeleton';

import { RoomContent } from './room-content';

interface RoomPageProps {
  params: Promise<{
    slug: string;
    roomSlug: string;
  }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  // Utiliser useParams pour obtenir les paramètres côté client
  const routeParams = useParams();
  const resolvedParams = use(params);
  
  // Fusionner les paramètres de la route avec les paramètres résolus
  const eventId = (routeParams?.slug as string) || resolvedParams.slug;
  const roomId = (routeParams?.roomSlug as string) || resolvedParams.roomSlug;

  
  return (
    <Suspense
      fallback={
        <div className="container py-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-10 w-10">
              <Skeleton className="h-full w-full rounded-full" />
            </div>
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
              <Skeleton className="h-[400px]" />
            </div>
          </div>
        </div>
      }
    >
      <RoomContent eventId={eventId} roomId={roomId} />
    </Suspense>
  );
}
