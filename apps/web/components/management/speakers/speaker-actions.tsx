'use client';

import { useTranslation } from 'react-i18next';
import '@/app/i18n/client';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Speaker } from '@/types/speaker';

interface SpeakerActionsProps {
  speaker: Speaker;
  onEdit: (speaker: Speaker) => void;
  onDelete: (speakerId: string) => void;
}

export function SpeakerActions({ speaker, onEdit, onDelete }: SpeakerActionsProps) {
  const { t } = useTranslation('components/event-manage');

  return (
    <div className="flex space-x-2">
      <Button variant="ghost" size="icon" onClick={() => onEdit(speaker)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('speakers.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('speakers.deleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(speaker.id)}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}