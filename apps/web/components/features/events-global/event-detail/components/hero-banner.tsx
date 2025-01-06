'use client';

import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { Share } from 'lucide-react';
import { Button } from '@/components/core/ui/button';
import { cn } from '@/lib/utils';

interface HeroBannerProps {
  title: string;
  imageUrl: string;
  date: string;
  location: string;
  onRegister: () => void;
  onShare: () => void;
}

export function HeroBanner({
  title,
  imageUrl,
  date,
  location,
  onRegister,
  onShare,
}: HeroBannerProps) {
  const { t } = useTranslation('components/event-detail');

  return (
    <div className="relative w-full h-[60vh] min-h-[400px] overflow-hidden">
      {/* Image de fond avec overlay gradient */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-background/20" />
      </div>

      {/* Contenu */}
      <div className="relative h-full container">
        <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
          <div className="flex items-center gap-4">
            <time className="text-sm font-medium text-primary-400">{date}</time>
            <span className="text-sm text-muted-foreground">{location}</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            {title}
          </h1>

          <div className="flex items-center gap-4 pt-4">
            <Button
              size="lg"
              className={cn(
                "bg-primary text-primary-100 hover:bg-primary/90",
                "shadow-lg hover:shadow-xl transition-all"
              )}
              onClick={onRegister}
            >
              {t('hero.register')}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground"
              onClick={onShare}
            >
              <Share className="h-5 w-5" />
              <span className="sr-only">{t('hero.share')}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
