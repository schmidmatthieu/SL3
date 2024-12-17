'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEventStore } from '@/store/event.store';
import { useAuthStore } from '@/store/auth-store';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EventDashboard } from '@/components/management/event-dashboard';

export default function ManageEventPage() {
  const router = useRouter();
  const params = useParams();
  const { currentEvent, fetchEvent, isLoading, error } = useEventStore();
  const { user, profile } = useAuthStore();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    console.log('ManageEventPage - Params:', params);
    if (params.eventId) {
      console.log('ManageEventPage - Fetching event with ID:', params.eventId);
      fetchEvent(params.eventId as string).finally(() => {
        setIsInitialLoad(false);
      });
    }
  }, [params.eventId, fetchEvent]);

  // Handle authentication and authorization
  useEffect(() => {
    console.log('ManageEventPage - Auth state:', {
      isInitialLoad,
      isLoading,
      user,
      profile,
      currentEvent,
      error
    });

    if (!isInitialLoad && !isLoading) {
      if (!user) {
        console.log('ManageEventPage - No user, redirecting to login');
        router.push('/login');
        return;
      }

      if (!currentEvent && !error?.includes('Management')) {
        console.log('ManageEventPage - No event found, redirecting to events');
        router.push('/events');
        return;
      }

      const isAdmin = profile?.role === 'admin';
      const isEventCreator = user.id === currentEvent?.createdBy;
      console.log('ManageEventPage - Authorization check:', {
        isAdmin,
        isEventCreator,
        userId: user.id,
        createdBy: currentEvent?.createdBy
      });

      if (currentEvent && !isAdmin && !isEventCreator) {
        console.log('ManageEventPage - User not authorized, redirecting to events');
        router.push('/events');
      }
    }
  }, [user, profile, currentEvent, isLoading, error, router, isInitialLoad]);

  // Loading state
  if (isLoading || isInitialLoad) {
    console.log('ManageEventPage - Showing loading state');
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
  if (error && !error.includes('Management')) {
    console.log('ManageEventPage - Showing error state:', error);
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
    console.log('ManageEventPage - No event found');
    return (
      <div className="container py-10">
        <Alert>
          <AlertDescription>No event found or insufficient permissions.</AlertDescription>
        </Alert>
      </div>
    );
  }

  console.log('ManageEventPage - Rendering EventDashboard with event:', currentEvent);
  return <EventDashboard event={currentEvent} />;
}