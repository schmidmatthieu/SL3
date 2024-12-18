"use client";

import { EventSettings } from "@/components/management/settings/event-settings";
import { BackButton } from "@/components/ui/back-button";
import { useEvents } from "@/hooks/useEvents";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { currentEvent, fetchEvent, isLoading, error } = useEvents(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        if (eventId) {
          await fetchEvent(eventId);
        }
      } catch (error) {
        console.error('Error loading event:', error);
      } finally {
        setIsInitialLoad(false);
      }
    };

    loadEvent();
  }, [eventId, fetchEvent]);

  if (isLoading || isInitialLoad) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="container py-8">
        <Alert>
          <AlertDescription>Event not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <BackButton className="mb-6" />
      <h1 className="text-3xl font-bold tracking-tight mb-8">Event Settings</h1>
      <EventSettings event={currentEvent} />
    </div>
  );
}
