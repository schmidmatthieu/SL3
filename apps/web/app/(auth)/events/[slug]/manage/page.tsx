'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { useEventStore } from '@/lib/store/event.store';

import { Alert, AlertDescription } from '@/components/core/ui/alert';
import { Skeleton } from '@/components/core/ui/skeleton';
import { EventDashboard } from '@/components/features/events-global/management/event-dashboard';

export default function ManageEventPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { currentEvent, fetchEvent, isLoading, error } = useEventStore();
  const { user, profile } = useAuthStore();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const loadEvent = async () => {
      if (!slug) {
        console.error('ManageEventPage - No event slug provided');
        router.push('/events');
        return;
      }

      try {
        await fetchEvent(slug);
      } catch (error) {
        console.error('ManageEventPage - Error fetching event:', error);
      } finally {
        setIsInitialLoad(false);
      }
    };

    loadEvent();
  }, [slug, fetchEvent, router]);

  // Handle authentication and authorization
  useEffect(() => {
    if (!isInitialLoad && !isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (!currentEvent) {
        router.push('/events');
        return;
      }

      const isAdmin = profile?.role === 'admin';
      const isEventCreator = user.id === currentEvent.createdBy;

      if (!isAdmin && !isEventCreator) {
        router.push('/events');
      }
    }
  }, [user, profile, currentEvent, isLoading, error, router, isInitialLoad]);

  // Loading state
  if (isLoading || isInitialLoad) {
    return (
      <div className="container py-10">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // No event found state
  if (!currentEvent) {
    return (
      <div className="container py-10">
        <Alert>
          <AlertDescription>No event found or insufficient permissions.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return <EventDashboard event={currentEvent} slug={slug} />;
}
