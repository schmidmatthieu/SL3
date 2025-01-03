'use client';

import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, de, it } from 'date-fns/locale';

interface EventDescriptionProps {
  description: string;
  startDateTime: string;
  endDateTime: string;
  status: 'draft' | 'scheduled' | 'active' | 'ended' | 'cancelled' | 'postponed';
}

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
}: EventDescriptionProps) {
  const { t, i18n } = useTranslation('components/event-detail');
  const locale = locales[i18n.language as keyof typeof locales] || enUS;

  const formattedStartDate = format(new Date(startDateTime), 'PPP', { locale });
  const formattedEndDate = format(new Date(endDateTime), 'PPP', { locale });
  const formattedStartTime = format(new Date(startDateTime), 'p', { locale });
  const formattedEndTime = format(new Date(endDateTime), 'p', { locale });

  return (
    <section className="py-12">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Description principale */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              {t('description.about')}
            </h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              {description}
            </div>
          </div>

          {/* Détails de l'événement */}
          <div>
            <Card className="p-6 space-y-6">
              <h3 className="text-lg font-semibold">
                {t('description.details')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">{formattedStartDate}</div>
                    <div className="text-sm text-muted-foreground">
                      {formattedStartTime} - {formattedEndTime}
                    </div>
                  </div>
                </div>
                {startDateTime !== endDateTime && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">{formattedEndDate}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">
                      {t(`status.${status}`)}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
