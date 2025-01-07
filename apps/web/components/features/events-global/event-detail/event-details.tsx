'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Event } from '@/types/event';
import { Language } from '@/types/room';
import { Button } from '@/components/core/ui/button';
import { RoomCard } from '@/components/events/room-card';
import { RoomFilters } from '@/components/features/rooms-global/room-filters';
import { Timeline } from '@/components/event/event-detail/timeline';
import { HeroBanner } from './components/hero-banner';
import { EventDescription } from './components/description';
import { Speakers } from './components/speakers';

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
    if (!event.rooms) return [];

    return event.rooms.filter(room => {
      // Pour l'instant, on n'applique pas de filtres de temps/langue car ces infos ne sont pas dans notre modèle Room
      return true;
    });
  }, [event.rooms, selectedHour, selectedLanguages]);

  const handleLanguageToggle = (language: Language) => {
    setSelectedLanguages(prev =>
      prev.includes(language) ? prev.filter(l => l !== language) : [...prev, language]
    );
  };

  const handleRegister = () => {
    // TODO: Implémenter la logique d'inscription
    console.log('Register clicked');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="flex items-center gap-4 mb-8 p-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/events">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <HeroBanner
        title={event.title}
        imageUrl={event.imageUrl}
        date={event.startDateTime}
        location={event.location}
        onRegister={handleRegister}
        onShare={handleShare}
      />

      <div className="container py-8 space-y-8">
        <EventDescription
          description={event.description}
          startDateTime={event.startDateTime}
          endDateTime={event.endDateTime}
          status={event.status}
          location={event.location}
          maxParticipants={event.maxParticipants}
          currentParticipants={event.participants?.length || 0}
        />

        <div className="space-y-6">
          <div className="bg-card rounded-lg border">
            <Timeline selectedHour={selectedHour} onTimeSelect={setSelectedHour} event={event} />
          </div>

          <RoomFilters
            selectedLanguages={selectedLanguages}
            onLanguageToggle={handleLanguageToggle}
          />

          {filteredRooms.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <p className="text-muted-foreground">No rooms available for the selected filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRooms.map(room => (
                <RoomCard key={room._id} room={room} eventId={event._id} userLanguage="en" />
              ))}
            </div>
          )}
        </div>

        <Speakers speakers={event.speakers} rooms={event.rooms} />
      </div>
    </div>
  );
}
