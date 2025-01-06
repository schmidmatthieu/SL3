'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpDown } from 'lucide-react';

import { Event } from '@/types/event';
import { Room } from '@/types/room';
import { RoomCard } from './room-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/core/ui/select';
import { Button } from '@/components/core/ui/button';

const LANGUAGES = {
  fr: 'Français',
  en: 'English',
  de: 'Deutsch',
  it: 'Italiano',
};

type SortOption = 'name' | 'startTime' | 'participants' | '-name' | '-startTime' | '-participants';

const SORT_OPTIONS: Record<SortOption, { label: string; sortFn: (a: Room, b: Room) => number }> = {
  name: {
    label: 'Nom (A-Z)',
    sortFn: (a, b) => a.name.localeCompare(b.name),
  },
  '-name': {
    label: 'Nom (Z-A)',
    sortFn: (a, b) => b.name.localeCompare(a.name),
  },
  startTime: {
    label: 'Heure de début (croissant)',
    sortFn: (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  },
  '-startTime': {
    label: 'Heure de début (décroissant)',
    sortFn: (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
  },
  participants: {
    label: 'Participants (croissant)',
    sortFn: (a, b) => (a.participants?.length || 0) - (b.participants?.length || 0),
  },
  '-participants': {
    label: 'Participants (décroissant)',
    sortFn: (a, b) => (b.participants?.length || 0) - (a.participants?.length || 0),
  },
};

interface RoomsProps {
  event: Event;
}

export function Rooms({ event }: RoomsProps) {
  const { t, i18n } = useTranslation('components/event-detail');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('startTime');

  // Vérification de sécurité pour event et event.rooms
  if (!event?.rooms) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t('rooms.noRooms')}
      </div>
    );
  }

  // S'assurer que nous avons un eventId valide
  const eventId = event.id || event._id;
  if (!eventId) {
    console.error('Event is missing ID:', event);
    return (
      <div className="text-center py-12 text-destructive">
        {t('rooms.error')}
      </div>
    );
  }

  // Obtenir toutes les langues uniques
  const allLanguages = Array.from(
    new Set(
      event.rooms.flatMap(room => 
        [room.settings?.originalLanguage, ...(room.settings?.availableLanguages || [])]
      ).filter(Boolean)
    )
  );

  // Filtrer les salles par langue
  const filteredRooms = event.rooms
    .filter(room =>
      selectedLanguage === 'all'
        ? true
        : [room.settings?.originalLanguage, ...(room.settings?.availableLanguages || [])].includes(selectedLanguage)
    )
    // Trier les salles selon l'option sélectionnée
    .sort(SORT_OPTIONS[sortBy].sortFn);

  return (
    <section className="py-12">
      <div className="container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t('rooms.title')}
          </h2>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {allLanguages.length > 0 && (
              <Select
                value={selectedLanguage}
                onValueChange={setSelectedLanguage}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('rooms.filters.language')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('rooms.filters.all')}</SelectItem>
                  {allLanguages.map(lang => (
                    <SelectItem key={lang} value={lang}>
                      {LANGUAGES[lang as keyof typeof LANGUAGES] || lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortOption)}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Trier par..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SORT_OPTIONS).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRooms.map(room => {
            console.log('Rendering room card:', { roomId: room.id || room._id, eventId });
            return (
              <RoomCard
                key={room._id}
                room={room}
                eventId={eventId}
                userLanguage={i18n.language as any}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
