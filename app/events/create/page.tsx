'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { EventForm } from '@/components/events/event-form'
import { useAuth } from '@/hooks/use-auth'

export default function CreateEventPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (profile && !['admin', 'moderator'].includes(profile.role)) {
        router.push('/events')
      }
    }
  }, [user, profile, loading, router])

  if (loading) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-muted rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-12 bg-muted rounded"></div>
              <div className="h-12 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || (profile && !['admin', 'moderator'].includes(profile.role))) {
    return null
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Create New Event</h1>
        <EventForm user={user} />
      </div>
    </div>
  )
}