'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EventForm } from '@/components/events/event-form';
import { EventList } from '@/components/events/event-list';

export default function EventsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Si en cours de chargement ou pas d'utilisateur, ne rien afficher
  if (loading || !user) {
    return null;
  }

  const staticContent = {
    title: 'Events',
    createButton: 'Create Event',
    dialogTitle: 'Create New Event',
  };

  const translatedContent = {
    title: t('events.title'),
    createButton: t('events.createButton'),
    dialogTitle: t('events.createDialog.title'),
  };

  const content = isClient ? translatedContent : staticContent;

  return (
    <div className="container py-10 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{content.title}</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>{content.createButton}</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{content.dialogTitle}</DialogTitle>
            </DialogHeader>
            <EventForm />
          </DialogContent>
        </Dialog>
      </div>
      <EventList />
    </div>
  );
}
