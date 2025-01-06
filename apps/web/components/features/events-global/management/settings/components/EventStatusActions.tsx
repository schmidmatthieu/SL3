'use client';

import { Button } from '@/components/core/ui/button';
import { Event } from '@/types/event';
import { DeleteEventDialog } from './DeleteEventDialog';
import { useTranslation } from 'react-i18next';
import '@/app/i18n/client';

interface EventStatusActionsProps {
  event: Event;
  isLoading: boolean;
  isDeleting: boolean;
  isCancelling: boolean;
  onCancel: () => void;
  onDelete: () => void;
  onReactivate: () => void;
}

export function EventStatusActions({
  event,
  isLoading,
  isDeleting,
  isCancelling,
  onCancel,
  onDelete,
  onReactivate,
}: EventStatusActionsProps) {
  const { t } = useTranslation('management/settings/event-settings');

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <DeleteEventDialog isDeleting={isDeleting} onDelete={onDelete} />

      {event.status !== 'cancelled' ? (
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading || isCancelling}
          className="w-full sm:w-auto bg-secondary-100 hover:bg-secondary-200 text-secondary-900 hover:text-secondary-900 dark:hover:text-secondary-900 border-secondary-200 hover:border-secondary-300 transition-colors"
        >
          {isCancelling ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span> {t('eventSettings.actions.cancelling')}
            </span>
          ) : (
            t('eventSettings.actions.cancel')
          )}
        </Button>
      ) : (
        <Button
          variant="outline"
          onClick={onReactivate}
          disabled={isLoading}
          className="border-primary-200 dark:border-secondary-700 w-full bg-primary-50 text-primary-700 transition-colors hover:border-primary-300 hover:bg-primary-100 hover:text-primary-700 dark:bg-secondary-700 dark:text-primary-100 dark:hover:bg-secondary-600 dark:hover:text-primary-100 sm:w-auto"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span> {t('eventSettings.actions.reactivating')}
            </span>
          ) : (
            t('eventSettings.actions.reactivate')
          )}
        </Button>
      )}
    </div>
  );
}
