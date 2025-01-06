'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

import { Speaker } from '@/types/speaker';
import { Room } from '@/types/room';
import { Input } from '@/components/core/ui/input';
import { Button } from '@/components/core/ui/button';
import { SpeakerCard } from './speaker-card';
import { cn } from '@/lib/utils';

interface SpeakersProps {
  speakers: Speaker[];
  rooms: Room[];
}

const SPEAKERS_PER_PAGE = 10;

export function Speakers({ speakers, rooms }: SpeakersProps) {
  const { t } = useTranslation('components/event-detail');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrer les speakers en fonction de la recherche
  const filteredSpeakers = speakers.filter(speaker => {
    const searchString = searchQuery.toLowerCase();
    return (
      speaker.fullName.toLowerCase().includes(searchString) ||
      speaker.role?.toLowerCase().includes(searchString) ||
      speaker.company?.toLowerCase().includes(searchString) ||
      speaker.bio?.toLowerCase().includes(searchString)
    );
  });

  // Calculer les pages
  const totalPages = Math.ceil(filteredSpeakers.length / SPEAKERS_PER_PAGE);
  const startIndex = (currentPage - 1) * SPEAKERS_PER_PAGE;
  const displayedSpeakers = filteredSpeakers.slice(startIndex, startIndex + SPEAKERS_PER_PAGE);

  // Gérer la navigation des pages
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll en haut de la section speakers avec une animation douce
    document.getElementById('speakers-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Calculer le nombre de colonnes en fonction du nombre de speakers
  const getGridCols = (count: number) => {
    if (count <= 2) return 'grid-cols-1 sm:grid-cols-2';
    if (count <= 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    if (count <= 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';
  };

  return (
    <section id="speakers-section" className="py-12 container">
      <div className="">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            {t('speakers.title')}
          </h2>

          {/* Barre de recherche */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('speakers.search')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Réinitialiser la page lors d'une recherche
              }}
              className="pl-9 w-full sm:w-[300px]"
              aria-label={t('speakers.search')}
            />
          </div>
        </div>

        {/* Grille de speakers avec colonnes adaptatives */}
        <div className={cn(
          'grid gap-6',
          getGridCols(displayedSpeakers.length)
        )}>
          {displayedSpeakers.map(speaker => (
            <SpeakerCard
              key={speaker.id}
              speaker={speaker}
              rooms={rooms}
            />
          ))}
        </div>

        {/* Message si aucun résultat */}
        {filteredSpeakers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {t('speakers.noResults')}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label={t('common:previous')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  aria-label={t('common:page', { number: page })}
                  aria-current={currentPage === page ? 'page' : undefined}
                  className={cn(
                    "w-8 h-8",
                    currentPage === page && "bg-primary text-primary-foreground"
                  )}
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label={t('common:next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
