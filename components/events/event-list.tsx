'use client'

import { useEffect } from 'react'
import { useEvents } from '@/hooks/useEvents'
import { EventCard } from './event-card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

interface EventListProps {
  userId?: string
}

export function EventList({ userId }: EventListProps) {
  const { events, isLoading, error, fetchEvents, fetchMyEvents } = useEvents(true)

  useEffect(() => {
    if (userId) {
      fetchMyEvents()
    } else {
      fetchEvents()
    }
  }, [userId, fetchEvents, fetchMyEvents])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[300px] w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!events.length) {
    return (
      <Alert>
        <AlertDescription>
          {userId ? "You haven't created any events yet." : "No events found."}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
