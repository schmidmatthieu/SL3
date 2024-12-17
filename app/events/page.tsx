'use client'

import { useAuth } from '@/hooks/use-auth'
import { EventList } from '@/components/events/event-list'
import { EventForm } from '@/components/events/event-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function EventsPage() {
  const { user } = useAuth()

  return (
    <div className="container py-10 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events</h1>
        {user && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>Create Event</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <EventForm />
            </DialogContent>
          </Dialog>
        )}
      </div>
      <EventList />
    </div>
  )
}