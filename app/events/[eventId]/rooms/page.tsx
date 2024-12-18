"use client";

import { ManageRooms } from "@/components/management/rooms/manage-rooms";
import { BackButton } from "@/components/ui/back-button";
import { useEvents } from "@/hooks/useEvents";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoomsPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { currentEvent, fetchEvent } = useEvents(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvent = async () => {
      await fetchEvent(eventId);
      setLoading(false);
    };
    loadEvent();
  }, [eventId, fetchEvent]);

  if (loading || !currentEvent) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container py-8">
      <BackButton className="mb-6" />
      <h1 className="text-3xl font-bold tracking-tight mb-8">Manage Rooms</h1>
      <ManageRooms />
    </div>
  );
}
