import { Event } from "@/types/event";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEventStore } from "@/store/event.store";
import { useRouter } from 'next/navigation';
import { useState } from "react";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { 
  Calendar,
  Image,
  Info,
  Link,
  Type,
} from "lucide-react";

interface EventSettingsProps {
  event: Event;
}

export function EventSettings({ event }: EventSettingsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { updateEvent, deleteEvent, fetchEvents } = useEventStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description || "",
    startDateTime: event.startDateTime ? new Date(event.startDateTime) : null,
    endDateTime: event.endDateTime ? new Date(event.endDateTime) : null,
    location: event.location || "",
    maxParticipants: event.maxParticipants?.toString() || "",
    type: event.type || "public",
  });

  // Fonction pour ajuster la date de fin si nécessaire
  const adjustEndDateTime = (newStartDate: Date) => {
    const currentEndDate = new Date(formData.endDateTime);
    
    // Si la nouvelle date de début est après la date de fin actuelle
    if (newStartDate >= currentEndDate) {
      // On ajoute 1 heure à la date de début pour la nouvelle date de fin
      const newEndDate = new Date(newStartDate);
      newEndDate.setHours(newEndDate.getHours() + 1);
      setFormData(prev => ({
        ...prev,
        endDateTime: newEndDate
      }));
    }
  };

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      const currentEndDate = new Date(formData.endDateTime);
      let newEndDate = currentEndDate;
      
      // Si la date de fin est avant ou égale à la nouvelle date de début
      if (currentEndDate <= date) {
        // Ajouter 1 heure à la nouvelle date de début
        newEndDate = new Date(date);
        newEndDate.setHours(newEndDate.getHours() + 1);
      }
      
      setFormData(prev => ({
        ...prev,
        startDateTime: date,
        endDateTime: newEndDate
      }));
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      // Vérifier que la nouvelle date de fin est après la date de début
      const startDate = new Date(formData.startDateTime);
      if (date <= startDate) {
        // Si la date est invalide, ajouter 1 heure à la date de début
        const newEndDate = new Date(startDate);
        newEndDate.setHours(newEndDate.getHours() + 1);
        
        setFormData(prev => ({
          ...prev,
          endDateTime: newEndDate
        }));
        
        toast({
          title: "Invalid end date",
          description: "End date must be after start date",
          variant: "destructive",
        });
      } else {
        setFormData(prev => ({
          ...prev,
          endDateTime: date
        }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const eventId = event._id || event.id;
      if (!eventId) {
        throw new Error('Event ID is missing');
      }

      // Vérifier que la date de fin est après la date de début
      if (new Date(formData.endDateTime) <= new Date(formData.startDateTime)) {
        throw new Error('End date must be after start date');
      }

      const updateData: Partial<Event> = {
        title: formData.title,
        description: formData.description,
        startDateTime: formData.startDateTime?.toISOString(),
        endDateTime: formData.endDateTime?.toISOString(),
        rooms: parseInt(formData.maxParticipants)
      };

      // Calculer le nouveau statut si les dates ont changé
      if (formData.startDateTime || formData.endDateTime) {
        const newStatus = calculateEventStatus(
          new Date(formData.startDateTime),
          new Date(formData.endDateTime)
        );
        updateData.status = newStatus;
      }

      // Mettre à jour l'événement
      const updatedEvent = await updateEvent(eventId, updateData);

      // Mettre à jour l'état local
      setFormData({
        ...formData,
        title: formData.title,
        maxParticipants: parseInt(formData.maxParticipants),
        description: formData.description,
        startDateTime: formData.startDateTime?.toISOString() || event.startDateTime,
        endDateTime: formData.endDateTime?.toISOString() || event.endDateTime,
        location: formData.location,
        type: formData.type
      });

      toast({
        title: "Success",
        description: "Event settings have been updated.",
      });
      
      // Recharger la liste des événements et rediriger vers la page des paramètres de l'événement
      await fetchEvents();
      router.push(`/events/${eventId}/manage`);
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: error.message,
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
        throw new Error('Event ID is missing');
      }

      await updateEvent(eventId, { status: 'cancelled' });

      toast({
        title: "Event cancelled",
        description: "Event has been cancelled.",
      });

      // Recharger la liste des événements et rediriger
      await fetchEvents();
      router.push(`/events/${eventId}/manage`);
    } catch (error) {
      console.error('Error cancelling event:', error);
      toast({
        title: "Error",
        description: error.message,
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
        throw new Error('Event ID is missing');
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

      await updateEvent(eventId, { status: newStatus });

      toast({
        title: "Event reactivated",
        description: "Event has been reactivated.",
      });

      // Recharger la liste des événements et rediriger
      await fetchEvents();
      router.push(`/events/${eventId}/manage`);
    } catch (error) {
      console.error('Error reactivating event:', error);
      toast({
        title: "Error",
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
        throw new Error('Event ID is missing');
      }

      await deleteEvent(eventId);
      toast({
        title: "Success",
        description: "Event has been deleted.",
      });
      router.push('/events');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Update your event's basic details and settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              <Type className="w-4 h-4 inline-block mr-2" />
              Event Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              <Info className="w-4 h-4 inline-block mr-2" />
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>
                <Calendar className="w-4 h-4 inline-block mr-2" />
                Start Date & Time
              </Label>
              <DateTimePicker
                value={formData.startDateTime}
                onChange={handleStartDateChange}
              />
            </div>

            <div className="space-y-2">
              <Label>
                <Calendar className="w-4 h-4 inline-block mr-2" />
                End Date & Time
              </Label>
              <DateTimePicker
                value={formData.endDateTime}
                onChange={handleEndDateChange}
                min={new Date(formData.startDateTime)}
              />
            </div>
          </div>
          
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete Event"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  event and remove all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Bouton d'annulation ou de réactivation selon le statut */}
          {event.status !== 'cancelled' ? (
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isLoading || isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Cancel Event"}
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={handleReactivate}
              disabled={isLoading}
            >
              {isLoading ? "Reactivating..." : "Reactivate Event"}
            </Button>
          )}
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
