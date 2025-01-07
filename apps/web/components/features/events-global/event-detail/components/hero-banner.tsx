'use client';

import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Event } from '@/types/event';
import { Button } from '@/components/core/ui/button';
import { Share, Calendar, MapPin } from 'lucide-react';

interface HeroBannerProps {
  event: Event;
  onShare: () => void;
}

export function HeroBanner({ event, onShare }: HeroBannerProps) {
  const { t } = useTranslation('components/event-detail');
  const defaultImageUrl = '/images/event-default-banner.jpg';

  const formattedDate = event.startDate ? format(new Date(event.startDate), 'PPP', { locale: fr }) : '';

  return (
    <div className="relative w-full h-[60vh] min-h-[400px] overflow-hidden">
      {/* Image de fond avec overlay gradient */}
      <div className="absolute inset-0">
        <Image
          src={event.imageUrl || defaultImageUrl}
          alt={event.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-primary-800/20" />
      </div>

      {/* Contenu */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
        <div className="container mx-auto">
          <h1 className="text-5xl md:text-8xl font-bold text-white mb-4">{event.title}</h1>
          
          <div className="flex flex-wrap gap-4 text-white/90 mb-6">
            {formattedDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{formattedDate}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{event.location}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              onClick={() => window.location.href = '#register'}
              className="bg-primary hover:bg-primary/90"
            >
              {t('hero.register')}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              onClick={onShare}
            >
              <Share className="h-4 w-4 mr-2" />
              {t('hero.share')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
