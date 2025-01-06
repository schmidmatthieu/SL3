'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

import { EventBasicInfo } from './EventBasicInfo';
import { EventDateTime } from './EventDateTime';

import type { Event } from '@/types/event';
import type { EventFormData } from '../types/event-settings.types';

import '@/app/i18n/client';

interface EventSettingsFormProps {
  formData: EventFormData;
  setFormData: (data: EventFormData) => void;
  event: Event;
  isFormDisabled: boolean;
  handleFeaturedChange: (featured: boolean) => void;
  handleStartDateChange: (date: Date) => void;
  handleEndDateChange: (date: Date) => void;
}

/**
 * @component EventSettingsForm
 * @description Form component for event settings, handling basic info and date/time inputs
 */
export function EventSettingsForm({
  formData,
  setFormData,
  event,
  isFormDisabled,
  handleFeaturedChange,
  handleStartDateChange,
  handleEndDateChange,
}: EventSettingsFormProps): React.ReactElement {
  const { t } = useTranslation('management/settings/event-settings');

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold" id="settings-title">
          {t('eventSettings.title')}
        </h2>
      </div>

      <EventBasicInfo 
        formData={formData} 
        setFormData={setFormData} 
        event={event}
        onFeaturedChange={handleFeaturedChange}
        disabled={isFormDisabled}
      />

      <EventDateTime 
        formData={formData} 
        handleStartDateChange={handleStartDateChange}
        handleEndDateChange={handleEndDateChange}
        disabled={isFormDisabled}
      />
    </>
  );
}
