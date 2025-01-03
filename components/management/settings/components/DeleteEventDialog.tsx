'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import '@/app/i18n/client';

interface DeleteEventDialogProps {
  isDeleting: boolean;
  onDelete: () => void;
  children: React.ReactNode;
}

export function DeleteEventDialog({ isDeleting, onDelete, children }: DeleteEventDialogProps) {
  const { t } = useTranslation('management/settings/event-settings');

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:text-destructive-foreground dark:hover:text-destructive-foreground transition-colors"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span> {t('eventSettings.actions.deleting')}
            </span>
          ) : (
            t('eventSettings.actions.delete')
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-primary-900 dark:text-primary-100">
            {t('eventSettings.deleteDialog.title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-primary-600 dark:text-primary-400">
            {t('eventSettings.deleteDialog.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('eventSettings.deleteDialog.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:text-destructive-foreground dark:hover:text-destructive-foreground transition-colors"
          >
            {t('eventSettings.deleteDialog.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
