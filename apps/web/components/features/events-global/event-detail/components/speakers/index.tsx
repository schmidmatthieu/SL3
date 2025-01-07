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
  speakers?: Speaker[];
  rooms?: Room[];
}

const SPEAKERS_PER_PAGE = 10;

export function Speakers({ speakers = [], rooms = [] }: SpeakersProps) {
  const { t } = useTranslation('components/event-detail');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);


  // Filtrer les speakers en fonction de la recherche
  const filteredSpeakers = (speakers || []).filter(speaker => {
    const searchString = searchQuery.toLowerCase();
    return (
      speaker.fullName?.toLowerCase().includes(searchString) ||
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
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  };

  return (
    <section id="speakers-section" className="py-12 bg-secondary/5">
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tight mb-8">
          {t('speakers.title')}
        </h2>

        {/* Barre de recherche */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="search"
            placeholder={t('speakers.search')}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Réinitialiser la page lors d'une nouvelle recherche
            }}
          />
        </div>

        {/* Message si aucun speaker */}
        {filteredSpeakers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              {searchQuery ? t('speakers.noResults') : t('speakers.noSpeakers')}
            </p>
          </div>
        )}

        {/* Grille des speakers */}
        {filteredSpeakers.length > 0 && (
          <>
            <div className={cn(
              'grid gap-6',
              getGridCols(displayedSpeakers.length)
            )}>
              {displayedSpeakers.map((speaker) => (
                <SpeakerCard
                  key={speaker.id}
                  speaker={speaker}
                  rooms={rooms.filter(room => 
                    speaker.rooms?.includes(room.id)
                  )}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Page précédente</span>
                </Button>
                
                <span className="text-sm text-muted-foreground mx-4">
                  {currentPage} / {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Page suivante</span>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
