'use server';

import { Suspense } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

import { RoomContent } from './room-content';

interface RoomPageProps {
  params: {
    eventId: string;
    roomId: string;
  };
}

export default async function RoomPage({ params }: RoomPageProps) {
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
      <RoomContent eventId={params.eventId} roomId={params.roomId} />
    </Suspense>
  );
}
