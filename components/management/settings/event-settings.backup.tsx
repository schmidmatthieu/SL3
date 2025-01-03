import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEventStore } from '@/store/event.store';
import cn from 'classnames';
import { Calendar, Image, Info, Link, Type } from 'lucide-react';

import { Event } from '@/types/event';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { ImageUploader } from '@/components/ui/image-uploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface EventSettingsProps {
  event: Event;
}

interface EventFormData {
  title: string;
  description: string;
  imageUrl: string;
  startDateTime: Date | null;
  endDateTime: Date | null;
  featured: boolean;
}

export function EventSettings({ event }: EventSettingsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { updateEvent, updateEventStatus, deleteEvent, fetchEvents } = useEventStore();
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

  useEffect(() => {
    if (event) {
      setFormData(prev => ({
        ...prev,
        title: event.title,
        description: event.description,
        imageUrl: event.imageUrl || '',
        startDateTime: event.startDateTime ? new Date(event.startDateTime) : null,
        endDateTime: event.endDateTime ? new Date(event.endDateTime) : null,
        featured: event.featured || false,
      }));
    }
  }, [event]);

  // Fonction pour ajuster la date de fin si nécessaire
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

  // Format a date to ISO 8601 string without milliseconds
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

  const handleFeaturedChange = async (featured: boolean) => {
    try {
      const eventId = event._id || event.id;
      if (!eventId) {
        throw new Error("ID de l'événement manquant");
      }

      await updateEvent(eventId, { featured });
      setFormData(prev => ({
        ...prev,
        featured,
      }));

      toast({
        title: 'Mise à jour réussie',
        description: "Le statut 'Mise en avant' a été mis à jour",
      });
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast({
        title: 'Erreur',
        description: "Erreur lors de la mise à jour du statut 'Mise en avant'",
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('handleSubmit: Début de la soumission');
      console.log('handleSubmit: État du formulaire:', {
        ...formData,
        startDateTime: formData.startDateTime?.toISOString(),
        endDateTime: formData.endDateTime?.toISOString(),
      });

      const startDateTime = formatDate(formData.startDateTime);
      const endDateTime = formatDate(formData.endDateTime);

      console.log('handleSubmit: Dates après formatage:', { startDateTime, endDateTime });

      // Vérifier que les deux dates sont valides
      if (!startDateTime || !endDateTime) {
        throw new Error('Les dates de début et de fin doivent être valides');
      }

      // Vérifier que la date de début est avant la date de fin
      const startDate = new Date(startDateTime);
      const endDate = new Date(endDateTime);

      console.log('handleSubmit: Dates après parsing:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      if (startDate >= endDate) {
        throw new Error('La date de début doit être antérieure à la date de fin');
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
        const result = await updateEvent(event._id || event.id, filteredData);
        console.log('handleSubmit: Résultat de la mise à jour:', result);

        toast({
          title: 'Modifications enregistrées',
          description: 'Les modifications ont été enregistrées avec succès',
        });
      } catch (updateError) {
        console.error("handleSubmit: Erreur lors de l'appel à updateEvent:", updateError);
        throw updateError;
      }
    } catch (error) {
      console.error('handleSubmit: Erreur globale:', error);
      toast({
        title: 'Erreur',
        description:
          error.message || "Une erreur est survenue lors de la mise à jour de l'événement",
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gestionnaire pour les changements de date de début
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
          // Ajuster la date de fin si nécessaire
          adjustEndDateTime(validDate);
        } else {
          throw new Error('Date invalide');
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la date de début:', error);
        toast({
          title: 'Erreur',
          description: "La date de début sélectionnée n'est pas valide",
          variant: 'destructive',
        });
      }
    }
  };

  // Gestionnaire pour les changements de date de fin
  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      try {
        // S'assurer que la date est valide
        const validDate = new Date(date.getTime());
        if (!isNaN(validDate.getTime())) {
          // Vérifier que la date de fin est après la date de début
          if (formData.startDateTime && validDate <= formData.startDateTime) {
            throw new Error('La date de fin doit être après la date de début');
          }

          console.log('New end date:', validDate.toISOString());
          setFormData(prev => ({
            ...prev,
            endDateTime: validDate,
          }));
        } else {
          throw new Error('Date invalide');
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la date de fin:', error);
        toast({
          title: 'Erreur',
          description: error.message || "La date de fin sélectionnée n'est pas valide",
          variant: 'destructive',
        });
      }
    }
  };

  const calculateEventStatus = (start: Date, end: Date): EventStatus => {
    const now = new Date();

    // Si l'événement est déjà annulé, garder ce statut
    if (event.status === 'cancelled') {
      return 'cancelled';
    }

    // Sinon, calculer le statut en fonction des dates
    if (now < start) return 'scheduled';
    if (now > end) return 'ended';
    return 'active';
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const eventId = event._id || event.id;
      if (!eventId) {
        throw new Error("ID de l'événement manquant");
      }

      await updateEventStatus(eventId, 'cancelled');

      toast({
        title: 'Annulation réussie',
        description: "L'événement a été annulé.",
      });

      await fetchEvents();
      router.push(`/events/${eventId}/manage`);
    } catch (error) {
      console.error("Erreur lors de l'annulation de l'événement:", error);
      toast({
        title: 'Erreur',
        description:
          error.message || "Une erreur est survenue lors de l'annulation de l'événement.",
        variant: 'destructive',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReactivate = async () => {
    setIsLoading(true);
    try {
      const eventId = event._id || event.id;
      if (!eventId) {
        throw new Error("ID de l'événement manquant");
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
        title: 'Réactivation réussie',
        description: "L'événement a été réactivé.",
      });

      // Recharger la liste des événements et rediriger
      await fetchEvents();
      router.push(`/events/${eventId}/manage`);
    } catch (error) {
      console.error("Erreur lors de la réactivation de l'événement:", error);
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const eventId = event._id || event.id;
      if (!eventId) {
        throw new Error("ID de l'événement manquant");
      }

      await deleteEvent(eventId);
      toast({
        title: 'Suppression réussie',
        description: "L'événement a été supprimé.",
      });
      router.push('/events');
    } catch (error) {
      console.error("Erreur lors de la suppression de l'événement:", error);
      toast({
        title: 'Erreur',
        description: "Erreur lors de la suppression de l'événement. Veuillez réessayer.",
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="w-full border border-primary-200 dark:border-primary-800 shadow-sm bg-red-100">
        <CardContent className="space-y-8 pt-6">
          {/* Featured Section */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-primary-100/50 dark:bg-primary-900/50 border border-primary-200 dark:border-primary-700">
            <Label htmlFor="featured" className="flex flex-col cursor-pointer">
              <span className="font-medium text-primary-900 dark:text-primary-100">
                Mettre en avant
              </span>
              <span className="text-sm text-primary-700 dark:text-primary-300">
                L'événement apparaîtra en premier dans la liste
              </span>
            </Label>
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={checked => {
                setFormData(prev => ({ ...prev, featured: checked }));
                handleFeaturedChange(checked);
              }}
            />
          </div>

          {/* Basic Information Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-medium text-primary-900 dark:text-primary-100 flex items-center gap-2"
              >
                <Type className="w-4 h-4" />
                Titre de l'événement
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="border-primary-100/30 dark:border-primary-800/30 focus:border-primary-500"
                placeholder="Entrez le titre de l'événement"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-primary-900 dark:text-primary-100 flex items-center gap-2"
              >
                <Info className="w-4 h-4" />
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[120px] border-primary-100/30 dark:border-primary-800/30 focus:border-primary-500"
                placeholder="Décrivez votre événement"
                rows={4}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 w-full">
                <Label className="text-sm font-medium text-primary-900 dark:text-primary-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date et heure de début
                </Label>
                <DateTimePicker
                  value={formData.startDateTime}
                  onChange={handleStartDateChange}
                  className="w-full"
                />
              </div>

              <div className="space-y-2 w-full">
                <Label className="text-sm font-medium text-primary-900 dark:text-primary-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date et heure de fin
                </Label>
                <DateTimePicker
                  value={formData.endDateTime}
                  onChange={handleEndDateChange}
                  min={formData.startDateTime}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-medium text-primary-900 dark:text-primary-100 flex items-center gap-2">
                <Image className="w-4 h-4" />
                Image de l'événement
              </Label>
              <div className="overflow-hidden rounded-lg border border-primary-100/30 dark:border-primary-800/30">
                <ImageUploader
                  currentImage={formData.imageUrl}
                  onImageSelect={url => setFormData({ ...formData, imageUrl: url })}
                  mediaType="event"
                  entityId={event._id || event.id}
                  entityName={formData.title}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  onClick={handleDelete}
                  className="bg-destructive text-white hover:bg-destructive/90 transition-colors"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {event.status !== 'cancelled' ? (
            <Button
              variant="outline"
              onClick={handleCancel}
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
              variant="outline"
              onClick={handleReactivate}
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
    </form>
  );
}
