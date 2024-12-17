'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useEventStore } from '@/store/event.store';
import { EventStatus } from '@/types/event';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  startDateTime: z.date({
    required_error: 'Start date and time is required',
  }),
  endDateTime: z.date({
    required_error: 'End date and time is required',
  }),
  imageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function EventForm({ onComplete }: { onComplete?: () => void }) {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      startDateTime: now,
      endDateTime: tomorrow,
      imageUrl: '',
    },
  });

  const router = useRouter();
  const { user } = useAuth();
  const createEvent = useEventStore(state => state.createEvent);

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

      // Format dates as ISO strings
      const startDateTime = data.startDateTime.toISOString();
      const endDateTime = data.endDateTime.toISOString();

      const event = await createEvent({
        title: data.title,
        description: data.description,
        startDateTime,
        endDateTime,
        imageUrl: data.imageUrl || undefined,
        status,
        rooms: 1,
        createdBy: user.id,
      });

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
                      onChange={field.onChange}
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
                  <FormLabel>Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
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