'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context';
import { EventForm } from '@/components/events/event-form'

export default function CreateEventPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
      <EventForm user={user} />
    </div>
  )
}