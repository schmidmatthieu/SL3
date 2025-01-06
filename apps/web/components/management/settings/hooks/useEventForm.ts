'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useEventStore } from '@/store/event.store';
import { calculateEventStatus } from '@/utils/event-status';
import { isValidUrl } from '@/utils/url-validator';
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
      console.log('formatDate: date est null');
      return undefined;
    }

    try {
      // Validate the date
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.error('formatDate: Date invalide:', date);
        return undefined;
      }

      // Format to ISO string and remove milliseconds
      const isoString = date.toISOString();
      console.log('formatDate: Date formatée:', { original: date, formatted: isoString });
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
          console.log('New start date:', validDate.toISOString());
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
          console.log('New end date:', validDate.toISOString());
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

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('handleSubmit: Début de la soumission');
      console.log('handleSubmit: État du formulaire:', {
        ...formData,
        startDateTime: formData.startDateTime?.toISOString(),
        endDateTime: formData.endDateTime?.toISOString(),
      });

      const eventId = event._id || event.id;
      if (!eventId) {
        throw new Error(t('eventSettings.messages.missingEventId'));
      }

      const startDateTime = formatDate(formData.startDateTime);
      const endDateTime = formatDate(formData.endDateTime);

      console.log('handleSubmit: Dates après formatage:', { startDateTime, endDateTime });

      // Vérifier que les deux dates sont valides
      if (!startDateTime || !endDateTime) {
        throw new Error(t('eventSettings.messages.invalidDates'));
      }

      // Vérifier que la date de début est avant la date de fin
      const startDate = new Date(startDateTime);
      const endDate = new Date(endDateTime);

      console.log('handleSubmit: Dates après parsing:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      if (startDate >= endDate) {
        throw new Error(t('eventSettings.messages.dateError'));
      }

      // Validation de l'URL de l'image
      if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
        throw new Error(t('eventSettings.messages.invalidImageUrl'));
      }

      const updatedData = {
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl || undefined,
        startDateTime,
        endDateTime,
        featured: formData.featured,
      };

      // Filtrer les champs undefined
      const filteredData = Object.fromEntries(
        Object.entries(updatedData).filter(([_, value]) => value !== undefined)
      );

      console.log('handleSubmit: Données à envoyer:', filteredData);

      try {
        const result = await updateEvent(eventId, filteredData);
        console.log('handleSubmit: Résultat de la mise à jour:', result);

        // Mettre à jour le statut en fonction des nouvelles dates
        const newStatus = calculateEventStatus(startDate, endDate, event.status);
        if (newStatus !== event.status) {
          await updateEventStatus(eventId, newStatus);
        }

        toast({
          title: t('eventSettings.messages.success'),
          description: t('eventSettings.messages.successDescription'),
        });

        router.refresh();
      } catch (updateError) {
        console.error("handleSubmit: Erreur lors de l'appel à updateEvent:", updateError);
        throw updateError;
      }
    } catch (error: any) {
      console.error('handleSubmit: Erreur globale:', error);
      toast({
        title: t('eventSettings.messages.error'),
        description: error.message || t('eventSettings.messages.errorDescription'),
        variant: 'destructive',
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

      await updateEvent(eventId, { featured });
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
