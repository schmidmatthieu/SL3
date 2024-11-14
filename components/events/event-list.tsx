"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2 } from "lucide-react";
import type { EventWithRooms } from "@/types/events";
import { EditEventDialog } from "./edit-event-dialog";

export function EventList() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<EventWithRooms[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventWithRooms | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setEvents(events.filter((event) => event.id !== eventId));
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <Card key={event.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription>
                  {format(new Date(event.startDate), "PPP")} -{" "}
                  {format(new Date(event.endDate), "PPP")}
                </CardDescription>
              </div>
              <Badge>{t(`events.accessType.${event.accessType}`)}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {event.description}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedEvent(event);
                  setIsEditDialogOpen(true);
                }}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                {t("common.edit")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(event.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t("common.delete")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {selectedEvent && (
        <EditEventDialog
          event={selectedEvent}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={() => {
            setIsEditDialogOpen(false);
            fetchEvents();
          }}
        />
      )}
    </div>
  );
}