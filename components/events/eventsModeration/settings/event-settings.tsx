"use client";

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
import { calculateEventStatus } from '@/utils/event-status';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description || "",
    startDateTime: event.startDateTime ? new Date(event.startDateTime) : null,
    endDateTime: event.endDateTime ? new Date(event.endDateTime) : null,
    imageUrl: event.imageUrl || "",
    rooms: event.rooms?.toString() || "1",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const eventId = event._id || event.id;
      if (!eventId) {
        throw new Error('Event ID is missing');
      }

      const status = formData.startDateTime && formData.endDateTime
        ? calculateEventStatus(formData.startDateTime, formData.endDateTime)
        : event.status;

      const updatedEvent = await updateEvent(eventId, {
        title: formData.title,
        description: formData.description,
        startDateTime: formData.startDateTime?.toISOString(),
        endDateTime: formData.endDateTime?.toISOString(),
        imageUrl: formData.imageUrl || undefined,
        status,
        rooms: parseInt(formData.rooms),
      });

      toast({
        title: t('common.success'),
        description: t('eventSettings.updateSuccess'),
      });

      router.refresh();
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: t('common.error'),
        description: t('eventSettings.updateError'),
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
        title: t('common.success'),
        description: t('eventSettings.cancelSuccess'),
      });
      router.refresh();
    } catch (error) {
      console.error('Error cancelling event:', error);
      toast({
        title: t('common.error'),
        description: t('eventSettings.cancelError'),
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
        title: t('common.success'),
        description: t('eventSettings.deleteSuccess'),
      });
      router.push('/events');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: t('common.error'),
        description: t('eventSettings.deleteError'),
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
          <CardTitle>{t('eventSettings.basicInfo.title')}</CardTitle>
          <CardDescription>
            {t('eventSettings.basicInfo.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Title */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="title" className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                {t('eventSettings.basicInfo.eventTitle')}
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* Description */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description" className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                {t('eventSettings.basicInfo.description')}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* Image URL */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="imageUrl" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                {t('eventSettings.basicInfo.imageUrl')}
              </Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="https://images.unsplash.com/photo-ID?q=80&w=2000&auto=format&fit=crop"
              />
            </div>

            {/* Start Date */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="startDateTime" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t('eventSettings.basicInfo.startDateTime')}
              </Label>
              <DateTimePicker
                value={formData.startDateTime}
                onChange={(date) =>
                  setFormData({ ...formData, startDateTime: date })
                }
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="endDateTime" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t('eventSettings.basicInfo.endDateTime')}
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
                {isDeleting ? t('eventSettings.actions.deleting') : t('eventSettings.actions.deleteEvent')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('eventSettings.deleteDialog.title')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('eventSettings.deleteDialog.description')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  {t('common.delete')}
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
                {isCancelling ? t('eventSettings.actions.cancelling') : t('eventSettings.actions.cancelEvent')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('eventSettings.cancelDialog.title')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('eventSettings.cancelDialog.description')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('eventSettings.cancelDialog.keepActive')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel}>
                  {t('eventSettings.cancelDialog.confirmCancel')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? t('common.saving') : t('common.saveChanges')}
        </Button>
      </div>
    </form>
  );
}
