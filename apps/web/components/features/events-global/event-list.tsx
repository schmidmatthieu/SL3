'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Event } from '@/lib/store/event.store';
import { useTranslation } from 'react-i18next';

import { useEvents } from '@/hooks/useEvents';
import { Alert, AlertDescription } from '@/components/core/ui/alert';
import { Skeleton } from '@/components/core/ui/skeleton';

import { EventCard } from './event-card';
import { EventFilters } from './event-filters';

interface EventListProps {
  userId?: string;
}

export function EventList({ userId }: EventListProps) {
  const { events, isLoading, error, fetchEvents, fetchMyEvents } = useEvents(true);
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    status: [],
    sortBy: 'date-desc',
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchMyEvents();
    } else {
      fetchEvents();
    }
  }, [userId, fetchEvents, fetchMyEvents]);

  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Filtre par recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        event =>
          event.title.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par statut
    if (filters.status.length > 0) {
      result = result.filter(event => filters.status.includes(event.status));
    }

    // Tri
    result.sort((a, b) => {
      // Les événements en vedette sont toujours en premier
      if (a.featured !== b.featured) {
        return a.featured ? -1 : 1;
      }

      // Ensuite, appliquer le tri sélectionné
      switch (filters.sortBy) {
        case 'date-asc':
          return new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime();
        case 'date-desc':
          return new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return result;
  }, [events, filters]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[52px] w-full max-w-[600px]" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[300px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  const staticContent = {
    error: 'An error occurred while loading events.',
    empty: {
      user: "You haven't created any events yet.",
      general: 'No events found.',
    },
  };

  const translatedContent = {
    error: t('events.list.error'),
    empty: {
      user: t('events.list.empty.user'),
      general: t('events.list.empty.general'),
    },
  };

  const content = isClient ? translatedContent : staticContent;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{content.error}</AlertDescription>
      </Alert>
    );
  }

  if (!events.length) {
    return (
      <Alert>
        <AlertDescription>{userId ? content.empty.user : content.empty.general}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <EventFilters onFiltersChange={setFilters} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map(event => (
          <EventCard key={event._id || event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
