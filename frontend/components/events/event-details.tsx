"use client";

import { useState, useMemo } from 'react';
import { Event } from '@/types/event';
import { Language } from '@/types/room';
import { rooms } from '@/lib/rooms';
import { RoomCard } from '@/components/events/room-card';
import { Timeline } from '@/components/events/timeline';
import { RoomFilters } from '@/components/events/room-filters';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EventDetailsProps {
  event: Event;
}

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
}

export function EventDetails({ event }: EventDetailsProps) {
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const roomStart = parseTime(room.startTime);
      const roomEnd = parseTime(room.endTime);
      const isInTimeRange = selectedHour >= roomStart && selectedHour < roomEnd;
      const hasSelectedLanguage = selectedLanguages.length === 0 || 
        selectedLanguages.some(lang => room.languages.includes(lang));

      return isInTimeRange && hasSelectedLanguage;
    });
  }, [selectedHour, selectedLanguages]);

  const handleLanguageToggle = (language: Language) => {
    setSelectedLanguages(prev => 
      prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/events">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
          <p className="text-muted-foreground">{event.venue}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-card rounded-lg border">
          <Timeline
            selectedHour={selectedHour}
            onTimeSelect={setSelectedHour}
          />
        </div>

        <RoomFilters
          selectedLanguages={selectedLanguages}
          onLanguageToggle={handleLanguageToggle}
        />

        {filteredRooms.length === 0 ? (
          <div className="text-center py-12 bg-muted rounded-lg">
            <p className="text-muted-foreground">
              No rooms available for the selected filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} eventId={event.id} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}