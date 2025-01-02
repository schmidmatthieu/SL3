'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useEventStore } from '@/store/event.store';
import { useMediaStore } from '@/store/media.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { EventStatus } from '@/types/event';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ImageUploader } from '@/components/ui/image-uploader';
import { Input } from '@/components/ui/input';

const formSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    startDateTime: z.date({
      required_error: 'Start date and time is required',
    }),
    endDateTime: z.date({
      required_error: 'End date and time is required',
    }),
    imageUrl: z.string().optional(),
  })
  .refine(data => data.endDateTime > data.startDateTime, {
    message: 'La date de fin doit être postérieure à la date de début',
    path: ['endDateTime'],
  });

type FormValues = z.infer<typeof formSchema>;

// Fonction pour arrondir à l'heure suivante
const roundToNextHour = (date: Date): Date => {
  const roundedDate = new Date(date);
  roundedDate.setMinutes(0);
  roundedDate.setSeconds(0);
  roundedDate.setMilliseconds(0);
  // Si nous avons déjà dépassé les minutes dans l'heure actuelle, on passe à l'heure suivante
  if (date.getMinutes() > 0) {
    roundedDate.setHours(date.getHours() + 1);
  }
  return roundedDate;
};

export function EventForm({ onComplete }: { onComplete?: () => void }) {
  const now = new Date();
  const roundedNow = roundToNextHour(now);
  const tomorrow = new Date(roundedNow);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      startDateTime: roundedNow,
      endDateTime: tomorrow,
      imageUrl: '',
    },
  });

  const router = useRouter();
  const { user } = useAuth();
  const createEvent = useEventStore(state => state.createEvent);
  const { addUsage, items } = useMediaStore();

  // Fonction pour formater les dates correctement
  const formatDate = (date: Date) => {
    if (!date) return undefined;
    const isoString = date.toISOString();
    console.log('formatDate: Date formatée:', { original: date, formatted: isoString });
    return isoString;
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (!user) {
        throw new Error('You must be logged in to create an event');
      }

      // Determine event status based on dates
      const now = new Date();
      let status: EventStatus;

      if (data.startDateTime > now) {
        status = 'scheduled';
      } else if (data.endDateTime < now) {
        status = 'ended';
      } else {
        status = 'active';
      }

      // Format dates before sending
      const formattedData = {
        ...data,
        startDateTime: formatDate(data.startDateTime),
        endDateTime: formatDate(data.endDateTime),
        status,
      };

      console.log('onSubmit: Données formatées:', formattedData);

      const event = await createEvent(formattedData);

      // Ajouter l'utilisation de l'image après la création de l'événement
      if (data.imageUrl) {
        const mediaId = items.find(item => item.url === data.imageUrl)?._id;
        if (mediaId) {
          await addUsage(mediaId, {
            type: 'event',
            entityId: event._id || event.id,
            entityName: data.title,
          });
        }
      }

      if (onComplete) {
        onComplete();
      }

      router.push(`/events/${event.id}`);
    } catch (error: any) {
      console.error('Failed to create event:', error);
      form.setError('root', {
        type: 'server',
        message: error.message || 'Failed to create event',
      });
    }
  };

  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Event title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Event description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDateTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date & Time</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={date => {
                        field.onChange(date);
                        // Mettre à jour automatiquement la date de fin à +1 jour
                        const endDate = new Date(date);
                        endDate.setDate(endDate.getDate() + 1);
                        form.setValue('endDateTime', endDate);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDateTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date & Time</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      minDate={form.getValues('startDateTime')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image de couverture</FormLabel>
                  <FormControl>
                    <ImageUploader
                      currentImage={field.value}
                      onImageSelect={url => field.onChange(url)}
                      mediaType="event"
                      entityName={form.getValues('title')}
                    />
                  </FormControl>
                  <FormDescription>
                    Cette image sera affichée comme couverture de votre événement
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Create Event
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
