'use client';

import { Button } from '@/components/ui/button';
import { EventSettingsProps } from './types/event-settings.types';
import { useEventForm } from './hooks/useEventForm';
import { EventBasicInfo } from './components/EventBasicInfo';
import { EventDateTime } from './components/EventDateTime';
import { EventStatusActions } from './components/EventStatusActions';
import { useTranslation } from 'react-i18next';
import '@/app/i18n/client';

export function EventSettings({ event: initialEvent }: EventSettingsProps) {
  const {
    formData,
    setFormData,
    isLoading,
    isDeleting,
    isCancelling,
    handleSubmit,
    handleCancel,
    handleDelete,
    handleReactivate,
    handleFeaturedChange,
    handleStartDateChange,
    handleEndDateChange,
  } = useEventForm(initialEvent);

  const { t } = useTranslation('management/settings/event-settings');

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{t('eventSettings.title')}</h2>
        </div>
        <EventBasicInfo 
          formData={formData} 
          setFormData={setFormData} 
          event={initialEvent}
          onFeaturedChange={handleFeaturedChange}
        />
        <EventDateTime 
          formData={formData} 
          handleStartDateChange={handleStartDateChange}
          handleEndDateChange={handleEndDateChange}
        />
        <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-between sm:items-center pt-6">
          <EventStatusActions
            event={initialEvent}
            isLoading={isLoading}
            isDeleting={isDeleting}
            isCancelling={isCancelling}
            onCancel={handleCancel}
            onDelete={handleDelete}
            onReactivate={handleReactivate}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto bg-primary text-white hover:bg-primary-600 transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> {t('eventSettings.actions.saving')}
              </span>
            ) : (
              t('eventSettings.actions.save')
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
