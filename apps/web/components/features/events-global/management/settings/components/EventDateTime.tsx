'use client';

import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/core/ui/card';
import { Label } from '@/components/core/ui/label';
import { DateTimePicker } from '@/components/core/ui/date-time-picker';
import { EventFormData } from '../types/event-settings.types';
import { useTranslation } from 'react-i18next';
import '@/app/i18n/client';

interface EventDateTimeProps {
  formData: EventFormData;
  handleStartDateChange: (date: Date) => void;
  handleEndDateChange: (date: Date) => void;
}

export function EventDateTime({
  formData,
  handleStartDateChange,
  handleEndDateChange,
}: EventDateTimeProps) {
  const { t } = useTranslation('management/settings/event-settings');

  return (
    <Card className="w-full border border-primary-200 dark:border-primary-800 shadow-sm">
      <CardContent className="space-y-8 pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 w-full">
            <Label className="text-sm font-medium text-primary-900 dark:text-primary-100 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t('eventSettings.dateTime.startDate')}
            </Label>
            <DateTimePicker
              value={formData.startDateTime}
              onChange={handleStartDateChange}
              className="w-full"
            />
          </div>

          <div className="space-y-2 w-full">
            <Label className="text-sm font-medium text-primary-900 dark:text-primary-100 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t('eventSettings.dateTime.endDate')}
            </Label>
            <DateTimePicker
              value={formData.endDateTime}
              onChange={handleEndDateChange}
              min={formData.startDateTime}
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
