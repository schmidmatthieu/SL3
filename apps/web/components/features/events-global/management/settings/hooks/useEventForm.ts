'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/core/ui/use-toast';
import { useEventStore } from '@/lib/store/event.store';
import { calculateEventStatus } from '@/lib/utils/events/event-status';
import { isValidUrl } from '@/lib/validations/url/url-validator';
import { Event, EventStatus } from '@/types/event';
import { EventFormData, EventUpdateData } from '../types/event-settings.types';
import { useTranslation } from 'react-i18next';
import '@/app/i18n/client';

export function useEventForm(event: Event) {
  const router = useRouter();
  const { t } = useTranslation('management/settings/event-settings');
  const { toast } = useToast();
  const { updateEvent, updateEventStatus, deleteEvent } = useEventStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const [formData, setFormData] = useState<EventFormData>({
    title: event.title,
    description: event.description || '',
    imageUrl: event.imageUrl || '',
    startDateTime: event.startDateTime ? new Date(event.startDateTime) : null,
    endDateTime: event.endDateTime ? new Date(event.endDateTime) : null,
    featured: event.featured || false,
  });

  const useEffect = (effect: () => void, deps: any[]) => {
    // implementation of useEffect
  };

  useEffect(() => {
    if (event) {
      setFormData(prev => ({
        ...prev,
        title: event.title,
        description: event.description || '',
        imageUrl: event.imageUrl || '',
        startDateTime: event.startDateTime ? new Date(event.startDateTime) : null,
        endDateTime: event.endDateTime ? new Date(event.endDateTime) : null,
        featured: event.featured || false,
      }));
    }
  }, [event]);

  const formatDate = (date: Date | null): string | undefined => {
    if (!date) {
      return undefined;
    }

    try {
      // Validate the date
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.error('formatDate: Date invalide:', date);
        return undefined;
      }

      // Convert to UTC and format to ISO string
      const utcDate = new Date(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
      ));

      // Format to ISO string with Z at the end
      const isoString = utcDate.toISOString();
      return isoString;
    } catch (error) {
      console.error('formatDate: Erreur lors du formatage:', error);
      return undefined;
    }
  };

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      try {
        // S'assurer que la date est valide
        const validDate = new Date(date.getTime());
        if (!isNaN(validDate.getTime())) {
          setFormData(prev => ({
            ...prev,
            startDateTime: validDate,
          }));
        } else {
          throw new Error(t('eventSettings.messages.invalidDate'));
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la date de début:', error);
        toast({
          title: t('eventSettings.messages.error'),
          description: t('eventSettings.messages.startDateError'),
          variant: 'destructive',
        });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        startDateTime: null,
      }));
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      try {
        // S'assurer que la date est valide
        const validDate = new Date(date.getTime());
        if (!isNaN(validDate.getTime())) {
          setFormData(prev => ({
            ...prev,
            endDateTime: validDate,
          }));
        } else {
          throw new Error(t('eventSettings.messages.invalidDate'));
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la date de fin:', error);
        toast({
          title: t('eventSettings.messages.error'),
          description: t('eventSettings.messages.endDateError'),
          variant: 'destructive',
        });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        endDateTime: null,
      }));
    }
  };

  // Ajuster la date de fin si nécessaire
  const adjustEndDateTime = (newStartDate: Date) => {
    if (!formData.endDateTime) return;

    const currentEndDate = formData.endDateTime;
    // Si la nouvelle date de début est après la date de fin actuelle
    if (newStartDate >= currentEndDate) {
      // On ajoute 1 heure à la date de début pour la nouvelle date de fin
      const newEndDate = new Date(newStartDate);
      newEndDate.setHours(newEndDate.getHours() + 1);
      setFormData(prev => ({
        ...prev,
        endDateTime: newEndDate,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    try {
      setIsLoading(true);

      // Validation des données
      if (!formData.title || formData.title.length < 3) {
        throw new Error(t('eventSettings.form.error.titleTooShort'));
      }

      if (!formData.description) {
        throw new Error(t('eventSettings.form.error.descriptionRequired'));
      }

      if (!formData.startDateTime) {
        throw new Error(t('eventSettings.form.error.startDateRequired'));
      }

      if (!formData.endDateTime) {
        throw new Error(t('eventSettings.form.error.endDateRequired'));
      }

      const startDateISO = formatDate(formData.startDateTime);
      const endDateISO = formatDate(formData.endDateTime);

      if (!startDateISO || !endDateISO) {
        throw new Error(t('eventSettings.form.error.invalidDates'));
      }

      // S'assurer que toutes les propriétés sont définies
      const updateData: EventUpdateData = {
        title: formData.title.trim() || event.title,
        description: formData.description?.trim() || event.description,
        imageUrl: formData.imageUrl?.trim() || event.imageUrl,
        startDateTime: startDateISO,
        endDateTime: endDateISO,
        featured: formData.featured ?? event.featured,
      };


      if (formData.imageFile) {
        updateData.imageFile = formData.imageFile;
      }

      const updatedEvent = await updateEvent(event.id, updateData);
      
      toast({
        title: t('eventSettings.form.success.title'),
        description: t('eventSettings.form.success.description'),
      });

      // Mettre à jour le formulaire avec les nouvelles données
      setFormData({
        title: updatedEvent.title,
        description: updatedEvent.description || '',
        imageUrl: updatedEvent.imageUrl || '',
        startDateTime: updatedEvent.startDateTime ? new Date(updatedEvent.startDateTime) : null,
        endDateTime: updatedEvent.endDateTime ? new Date(updatedEvent.endDateTime) : null,
        featured: updatedEvent.featured || false,
      });

    } catch (error: any) {
      console.error('handleSubmit: Erreur lors de l\'appel à updateEvent:', error);
      toast({
        variant: 'destructive',
        title: t('eventSettings.form.error.title'),
        description: error.message || t('eventSettings.form.error.description'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const eventId = event._id || event.id;
      if (!eventId) {
        throw new Error(t('eventSettings.messages.missingEventId'));
      }

      await updateEventStatus(eventId, 'cancelled');
      toast({
        title: t('eventSettings.messages.success'),
        description: t('eventSettings.messages.cancelSuccess'),
      });

      router.refresh();
    } catch (error: any) {
      console.error("Erreur lors de l'annulation de l'événement:", error);
      toast({
        title: t('eventSettings.messages.error'),
        description: t('eventSettings.messages.cancelError'),
        variant: 'destructive',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const eventId = event._id || event.id;
      if (!eventId) {
        throw new Error(t('eventSettings.messages.missingEventId'));
      }

      await deleteEvent(eventId);
      toast({
        title: t('eventSettings.messages.success'),
        description: t('eventSettings.messages.deleteSuccess'),
      });

      router.push('/events');
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'événement:", error);
      toast({
        title: t('eventSettings.messages.error'),
        description: t('eventSettings.messages.deleteError'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReactivate = async () => {
    setIsLoading(true);
    try {
      const eventId = event._id || event.id;
      if (!eventId) {
        throw new Error(t('eventSettings.messages.missingEventId'));
      }

      // Calculer le nouveau statut en fonction des dates
      const now = new Date();
      const startDate = new Date(event.startDateTime);
      const endDate = new Date(event.endDateTime);

      let newStatus: EventStatus;
      if (endDate < now) {
        newStatus = 'ended';
      } else if (startDate <= now && endDate >= now) {
        newStatus = 'active';
      } else {
        newStatus = 'scheduled';
      }

      await updateEventStatus(eventId, newStatus);

      toast({
        title: t('eventSettings.messages.success'),
        description: t('eventSettings.messages.reactivateSuccess'),
      });

      router.refresh();
    } catch (error: any) {
      console.error("Erreur lors de la réactivation de l'événement:", error);
      toast({
        title: t('eventSettings.messages.error'),
        description: t('eventSettings.messages.reactivateError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeaturedChange = async (featured: boolean) => {
    try {
      const eventId = event._id || event.id;
      if (!eventId) {
        throw new Error(t('eventSettings.messages.missingEventId'));
      }

      // Préparer les données de mise à jour
      const updateData: EventUpdateData = {
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        startDateTime: formatDate(formData.startDateTime) || event.startDateTime,
        endDateTime: formatDate(formData.endDateTime) || event.endDateTime,
        featured,
      };

      await updateEvent(eventId, updateData);
      setFormData(prev => ({
        ...prev,
        featured,
      }));

      toast({
        title: t('eventSettings.messages.success'),
        description: t('eventSettings.messages.featuredSuccess'),
      });
    } catch (error: any) {
      console.error('Error updating featured status:', error);
      toast({
        title: t('eventSettings.messages.error'),
        description: t('eventSettings.messages.featuredError'),
        variant: 'destructive',
      });
      // Remettre l'état précédent en cas d'erreur
      setFormData(prev => ({ ...prev, featured: !featured }));
    }
  };

  return {
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
    adjustEndDateTime,
  };
}
