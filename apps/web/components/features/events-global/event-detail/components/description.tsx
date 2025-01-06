'use client';

import { useTranslation } from 'react-i18next';
import { Card } from '@/components/core/ui/card';
import { Progress } from '@/components/core/ui/progress';
import { Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, de, it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { EventDescriptionProps } from './types';
import { EventStatusBadge } from '@/components/features/events-global/status/event-status-badge';

const locales = {
  fr,
  en: enUS,
  de,
  it,
};

export function EventDescription({
  description,
  startDateTime,
  endDateTime,
  status,
  location,
  maxParticipants,
  currentParticipants,
}: EventDescriptionProps) {
  const { t, i18n } = useTranslation('components/event-detail');
  const locale = locales[i18n.language as keyof typeof locales] || enUS;

  const formattedStartDate = format(new Date(startDateTime), 'PPP', { locale });
  const formattedEndDate = format(new Date(endDateTime), 'PPP', { locale });
  const formattedStartTime = format(new Date(startDateTime), 'p', { locale });
  const formattedEndTime = format(new Date(endDateTime), 'p', { locale });

  const participationRate = maxParticipants && currentParticipants
    ? (currentParticipants / maxParticipants) * 100
    : null;

  return (
    <section className="py-6 md:py-12" aria-labelledby="event-description-title">
      <div className="container px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Description principale */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h2 
                id="event-description-title" 
                className="text-2xl font-semibold tracking-tight text-primary"
              >
                {t('description.about')}
              </h2>
              <EventStatusBadge 
                event={{ 
                  status,
                  startDateTime,
                  endDateTime
                } as any}
                className="w-fit"
              />
            </div>
            <div 
              className="prose prose-gray dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>

          {/* Détails de l'événement */}
          <div>
            <Card className="p-6 space-y-6 border-primary/20">
              <h3 className="text-lg font-semibold text-primary">
                {t('description.details')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar 
                    className="h-5 w-5 text-primary mt-0.5" 
                    aria-hidden="true"
                  />
                  <div>
                    <div className="font-medium">
                      {t('description.startDate', { date: formattedStartDate })}
                    </div>
                    <div className="text-sm text-primary/80">
                      {t('description.startTime', { time: formattedStartTime })}
                    </div>
                  </div>
                </div>
                
                {startDateTime !== endDateTime && (
                  <div className="flex items-start gap-3">
                    <Calendar 
                      className="h-5 w-5 text-primary mt-0.5" 
                      aria-hidden="true"
                    />
                    <div>
                      <div className="font-medium">
                        {t('description.endDate', { date: formattedEndDate })}
                      </div>
                      <div className="text-sm text-primary/80">
                        {t('description.endTime', { time: formattedEndTime })}
                      </div>
                    </div>
                  </div>
                )}

                {location && (
                  <div className="flex items-start gap-3">
                    <MapPin 
                      className="h-5 w-5 text-primary mt-0.5" 
                      aria-hidden="true"
                    />
                    <div>
                      <div className="font-medium">{location}</div>
                    </div>
                  </div>
                )}

                {maxParticipants && currentParticipants && (
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <Users 
                        className="h-5 w-5 text-primary mt-0.5" 
                        aria-hidden="true"
                      />
                      <div>
                        <div className="font-medium">
                          {t('description.participants', { 
                            current: currentParticipants,
                            max: maxParticipants 
                          })}
                        </div>
                      </div>
                    </div>
                    <Progress 
                      value={participationRate} 
                      className="h-2 bg-primary/20"
                      aria-label={t('description.participationProgress')}
                    />
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
