'use client';

import { useTranslation } from 'react-i18next';
import { Card } from '@/components/core/ui/card';
import { Progress } from '@/components/core/ui/progress';
import { Calendar, MapPin, Users } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { fr, enUS, de, it } from 'date-fns/locale';
import { Event } from '@/types/event';
import { EventStatusBadge } from '@/components/features/events-global/status/event-status-badge';

const locales = {
  fr,
  en: enUS,
  de,
  it,
};

const formatEventDate = (dateString: string | undefined | null, formatStr: string, locale: Locale): string => {
  if (!dateString) {
    return '-';
  }

  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      console.error('Invalid date:', dateString);
      return '-';
    }
    return format(date, formatStr, { locale });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

interface EventDescriptionProps {
  event: Event;
}

export function EventDescription({ event }: EventDescriptionProps) {
  const { t, i18n } = useTranslation('components/event-detail');
  const locale = locales[i18n.language as keyof typeof locales] || enUS;

  const formattedStartDate = formatEventDate(event.startDateTime, 'PPP', locale);
  const formattedEndDate = formatEventDate(event.endDateTime, 'PPP', locale);
  const formattedStartTime = formatEventDate(event.startDateTime, 'p', locale);
  const formattedEndTime = formatEventDate(event.endDateTime, 'p', locale);

  const participationRate = event.maxParticipants > 0
    ? ((event.participants?.length || 0) / event.maxParticipants) * 100
    : 0;

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
                event={event}
                className="w-fit"
              />
            </div>
            <div 
              className="prose prose-gray dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: event.description || '' }}
            />
          </div>

          {/* Détails de l'événement */}
          <div>
            <Card className="p-6 space-y-6 border-primary/20">
              <h3 className="text-lg font-semibold text-primary">
                {t('description.details')}
              </h3>
              <div className="space-y-4">
                {event.startDateTime && (
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
                )}

                {event.endDateTime && (
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

                {event.location && (
                  <div className="flex items-start gap-3">
                    <MapPin 
                      className="h-5 w-5 text-primary mt-0.5" 
                      aria-hidden="true"
                    />
                    <div className="font-medium">{event.location}</div>
                  </div>
                )}

                {event.maxParticipants > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <Users 
                        className="h-5 w-5 text-primary mt-0.5" 
                        aria-hidden="true"
                      />
                      <div className="font-medium">
                        {t('description.participants', { 
                          current: event.participants?.length || 0,
                          max: event.maxParticipants
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-primary/80 mb-2">
                        {t('description.participationProgress')}
                      </div>
                      <Progress
                        value={participationRate}
                        max={100}
                        className="h-2"
                      />
                    </div>
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
