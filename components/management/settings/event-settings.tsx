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
import { useRouter } from "next/navigation";
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
  const { updateEvent, deleteEvent } = useEventStore();
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

  const calculateEventStatus = (start: Date, end: Date): EventStatus => {
    const now = new Date();
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

      // Calculer le nouveau statut en fonction des dates
      const status = formData.startDateTime && formData.endDateTime
        ? calculateEventStatus(formData.startDateTime, formData.endDateTime)
        : event.status;

      const updatedEvent = await updateEvent(eventId, {
        ...formData,
        status,
        startDateTime: formData.startDateTime?.toISOString(),
        endDateTime: formData.endDateTime?.toISOString(),
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
      });

      toast({
        title: "Success",
        description: "Event settings have been updated.",
      });

      router.refresh();
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event settings. Please try again.",
        variant: "destructive",
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
        title: "Success",
        description: "Event has been cancelled.",
      });
      router.refresh();
    } catch (error) {
      console.error('Error cancelling event:', error);
      toast({
        title: "Error",
        description: "Failed to cancel event. Please try again.",
        variant: "destructive",
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
                onChange={(date) =>
                  setFormData({ ...formData, startDateTime: date })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                <Calendar className="w-4 h-4 inline-block mr-2" />
                End Date & Time
              </Label>
              <DateTimePicker
                value={formData.endDateTime}
                onChange={(date) =>
                  setFormData({ ...formData, endDateTime: date })
                }
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

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                type="button" 
                variant="outline" 
                disabled={isCancelling || event.status === 'cancelled'}
              >
                {isCancelling ? "Cancelling..." : "Cancel Event"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will cancel the event for all participants. You can reactivate it later if needed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>No, keep it active</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel}>
                  Yes, cancel event
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
