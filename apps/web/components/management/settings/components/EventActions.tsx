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
import { Event } from '@/types/event';

interface EventActionsProps {
  isLoading: boolean;
  isDeleting: boolean;
  isCancelling: boolean;
  onCancel: () => void;
  onDelete: () => void;
  event: Event;
}

export function EventActions({
  isLoading,
  isDeleting,
  isCancelling,
  onCancel,
  onDelete,
  event,
}: EventActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-between sm:items-center pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto bg-destructive text-white hover:bg-destructive/90 transition-colors"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Suppression...
                </span>
              ) : (
                "Supprimer l'événement"
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="sm:max-w-[425px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-primary-900 dark:text-primary-100">
                Confirmer la suppression ?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-primary-600 dark:text-primary-400">
                Cette action est irréversible. L'événement et toutes les données associées seront
                définitivement supprimés.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-white hover:bg-destructive/90 transition-colors"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {event.status !== 'cancelled' ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading || isCancelling}
            className="w-full sm:w-auto bg-secondary-100 hover:bg-secondary-200 text-secondary-900 hover:text-secondary-900 border-secondary-200 hover:border-secondary-300 transition-colors"
          >
            {isCancelling ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Annulation...
              </span>
            ) : (
              "Annuler l'événement"
            )}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto bg-primary-50 hover:bg-primary-100 text-primary-700 border-primary-200 hover:border-primary-300 transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Réactivation...
              </span>
            ) : (
              "Réactiver l'événement"
            )}
          </Button>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full sm:w-auto bg-primary text-white hover:bg-primary-600 transition-colors"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span> Enregistrement...
          </span>
        ) : (
          'Enregistrer les modifications'
        )}
      </Button>
    </div>
  );
}
