'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import '@/app/i18n/client';

import { EventStatusActions } from './EventStatusActions';

import { Button } from '@/components/ui/button';
import type { Event } from '@/types/event';

interface EventSettingsButtonsProps {
  event: Event;
  isLoading: boolean;
  isDeleting: boolean;
  isCancelling: boolean;
  isFormDisabled: boolean;
  onCancel: () => void;
  onDelete: () => void;
  onReactivate: () => void;
}

/**
 * @component EventSettingsButtons
 * @description Buttons component for event settings, handling save, delete, cancel and reactivate actions
 */
export function EventSettingsButtons({
  event,
  isLoading,
  isDeleting,
  isCancelling,
  isFormDisabled,
  onCancel,
  onDelete,
  onReactivate,
}: EventSettingsButtonsProps): React.ReactElement {
  const { t } = useTranslation('management/settings/event-settings');

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-between sm:items-center pt-6">
      <EventStatusActions
        event={event}
        isLoading={isLoading}
        isDeleting={isDeleting}
        isCancelling={isCancelling}
        onCancel={onCancel}
        onDelete={onDelete}
        onReactivate={onReactivate}
      />

      <Button
        type="submit"
        disabled={isFormDisabled}
        className="w-full sm:w-auto bg-primary text-white hover:bg-primary-600 transition-colors"
        aria-busy={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2" role="status">
            <span className="animate-spin" aria-hidden="true">⏳</span> 
            {t('eventSettings.actions.saving')}
          </span>
        ) : (
          t('eventSettings.actions.save')
        )}
      </Button>
    </div>
  );
}
