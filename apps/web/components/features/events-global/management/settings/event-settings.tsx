'use client';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import '@/app/i18n/client';

import { EventSettingsButtons } from './components/EventSettingsButtons';
import { EventSettingsForm } from './components/EventSettingsForm';
import { useEventForm } from './hooks/useEventForm';
import type { EventSettingsProps } from './types/event-settings.types';

// Extracted form rendering logic
const renderEventForm = (
  formData: EventSettingsProps['event'],
  setFormData: (data: EventSettingsProps['event']) => void,
  initialEvent: EventSettingsProps['event'],
  isFormDisabled: boolean,
  handleFeaturedChange: (featured: boolean) => void,
  handleStartDateChange: (date: Date) => void,
  handleEndDateChange: (date: Date) => void,
  isLoading: boolean,
  isDeleting: boolean,
  isCancelling: boolean,
  handleCancel: () => void,
  handleDelete: () => void,
  handleReactivate: () => void,
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void,
): React.ReactElement => (
  <form 
    onSubmit={handleSubmit}
    className="space-y-6"
    aria-busy={isLoading}
  >
    <EventSettingsForm
      formData={formData}
      setFormData={setFormData}
      event={initialEvent}
      isFormDisabled={isFormDisabled}
      handleFeaturedChange={handleFeaturedChange}
      handleStartDateChange={handleStartDateChange}
      handleEndDateChange={handleEndDateChange}
    />

    <EventSettingsButtons
      event={initialEvent}
      isLoading={isLoading}
      isDeleting={isDeleting}
      isCancelling={isCancelling}
      isFormDisabled={isFormDisabled}
      onCancel={handleCancel}
      onDelete={handleDelete}
      onReactivate={handleReactivate}
    />
  </form>
);

/**
 * @component EventSettings
 * @description Main component for managing event settings. Orchestrates form and action components.
 *
 * @modularization
 * - Component divided into sub-modules:
 *   - EventSettingsForm: Form fields and inputs
 *   - EventSettingsButtons: Action buttons and status management
 *
 * @accessibility
 * - Form labels and ARIA roles
 * - Keyboard navigation support
 * - Loading state indicators
 */
export function EventSettings({ event: initialEvent }: EventSettingsProps): React.ReactElement {
  const { t } = useTranslation('management/settings/event-settings');
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

  const isFormDisabled = useMemo(
    () => isLoading || isDeleting || isCancelling,
    [isLoading, isDeleting, isCancelling]
  );

  return (
    <div role="region" aria-label={t('eventSettings.title')}>
      {renderEventForm(
        formData,
        setFormData,
        initialEvent,
        isFormDisabled,
        handleFeaturedChange,
        handleStartDateChange,
        handleEndDateChange,
        isLoading,
        isDeleting,
        isCancelling,
        handleCancel,
        handleDelete,
        handleReactivate,
        handleSubmit,
      )}
    </div>
  );
}
