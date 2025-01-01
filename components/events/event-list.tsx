'use client'

import { useEffect, useState } from 'react'
import { useEvents } from '@/hooks/useEvents'
import { EventCard } from './event-card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from 'react-i18next'

interface EventListProps {
  userId?: string
}

export function EventList({ userId }: EventListProps) {
  const { events, isLoading, error, fetchEvents, fetchMyEvents } = useEvents(true)
  const { t } = useTranslation()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

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

  const staticContent = {
    error: "An error occurred while loading events.",
    empty: {
      user: "You haven't created any events yet.",
      general: "No events found."
    }
  }

  const translatedContent = {
    error: t('events.list.error'),
    empty: {
      user: t('events.list.empty.user'),
      general: t('events.list.empty.general')
    }
  }

  const content = isClient ? translatedContent : staticContent

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{content.error}</AlertDescription>
      </Alert>
    )
  }

  if (!events.length) {
    return (
      <Alert>
        <AlertDescription>
          {userId ? content.empty.user : content.empty.general}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  )
}
