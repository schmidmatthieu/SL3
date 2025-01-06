'use client';

import { Suspense, useEffect, useState } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSpeakerStore } from '@/lib/store/speaker.store';
import { useRoomStore } from '@/lib/store/room.store';
import { useToast } from '@/components/core/ui/use-toast';
import { BackButton } from '@/components/core/ui/back-button';
import { Button } from '@/components/core/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/core/ui/dialog';
import { Input } from '@/components/core/ui/input';
import { Speaker } from '@/types/speaker';
import { SpeakerList } from './speaker-list';
import { SpeakerManagementProps, speakerFormSchema, SpeakerFormValues } from './types';
import { useTranslation } from 'react-i18next';
import '@/app/i18n/client';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/core/ui/form';
import { Textarea } from '@/components/core/ui/textarea';
import { RoomSelector } from './room-selector';

function SpeakerManagementContent({ eventId }: SpeakerManagementProps) {
  const { t } = useTranslation('components/event-manage');
  const { toast } = useToast();
  const { speakers, error, getSpeakers, createSpeaker, updateSpeaker, deleteSpeaker } =
    useSpeakerStore();
  const { rooms, fetchEventRooms } = useRoomStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSpeaker, setCurrentSpeaker] = useState<Speaker | null>(null);

  const form = useForm<SpeakerFormValues>({
    resolver: zodResolver(speakerFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      role: '',
      company: '',
      bio: '',
      imageUrl: '',
      rooms: [],
      socialLinks: {
        linkedin: '',
        twitter: '',
      },
    },
  });

  useEffect(() => {
    getSpeakers(eventId);
    console.log('Fetching rooms for event:', eventId);
    fetchEventRooms(eventId);
  }, [eventId, getSpeakers, fetchEventRooms]);

  useEffect(() => {
    console.log('Current rooms:', rooms);
  }, [rooms]);

  useEffect(() => {
    if (currentSpeaker) {
      form.reset({
        firstName: currentSpeaker.firstName || '',
        lastName: currentSpeaker.lastName,
        role: currentSpeaker.role || '',
        company: currentSpeaker.company || '',
        bio: currentSpeaker.bio || '',
        imageUrl: currentSpeaker.imageUrl || '',
        rooms: currentSpeaker.rooms?.map(id => id.toString()) || [],
        socialLinks: {
          linkedin: currentSpeaker.socialLinks?.linkedin || '',
          twitter: currentSpeaker.socialLinks?.twitter || '',
        },
      });
    } else {
      form.reset({
        firstName: '',
        lastName: '',
        role: '',
        company: '',
        bio: '',
        imageUrl: '',
        rooms: [],
        socialLinks: {
          linkedin: '',
          twitter: '',
        },
      });
    }
  }, [currentSpeaker, form]);

  const handleSubmit = async (values: SpeakerFormValues) => {
    try {
      setIsSubmitting(true);
      const speakerData = {
        ...values,
        eventId,
        rooms: values.rooms?.map(roomId => {
          // Ensure we have the correct room ID format
          const room = rooms.find(r => r.id === roomId || r._id === roomId);
          return room ? (room._id || room.id) : roomId;
        }) || [],
      };

      console.log('Submitting speaker data:', speakerData);

      if (currentSpeaker) {
        await updateSpeaker(eventId, currentSpeaker.id, speakerData);
        toast({
          title: t('speakers.success.update'),
          description: t('speakers.success.updateDescription'),
        });
      } else {
        await createSpeaker(eventId, speakerData);
        toast({
          title: t('speakers.success.create'),
          description: t('speakers.success.createDescription'),
        });
      }

      setIsAddDialogOpen(false);
      form.reset();
      setCurrentSpeaker(null);
    } catch (error) {
      console.error('Error submitting speaker:', error);
      toast({
        variant: 'destructive',
        title: t('speakers.error.title'),
        description: t('speakers.error.description'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (speaker: Speaker) => {
    try {
      await deleteSpeaker(eventId, speaker.id);
      toast({
        title: t('speakers.success.delete'),
        description: `${speaker.firstName} ${speaker.lastName}`,
      });
    } catch (error) {
      console.error('Error deleting speaker:', error);
      toast({
        title: t('speakers.error.delete'),
        description: `${speaker.firstName} ${speaker.lastName}`,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (speaker: Speaker) => {
    setCurrentSpeaker(speaker);
    setIsAddDialogOpen(true);
  };

  const filteredSpeakers = speakers.filter(
    speaker =>
      speaker.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      speaker.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="text-destructive">{t('speakers.error.load')}</p>
          <Button onClick={() => getSpeakers(eventId)}>{t('common.retry')}</Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="container mt-8 pt-8 pb-4">
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between gap-4">
            <Input
              placeholder={t('speakers.searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t('speakers.addButton')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {currentSpeaker ? t('speakers.editTitle') : t('speakers.addTitle')}
                  </DialogTitle>
                  <DialogDescription>{t('speakers.formDescription')}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('speakers.firstName')}</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} tabIndex={2} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('speakers.lastName')}</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} tabIndex={3} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('speakers.role')}</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} tabIndex={4} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('speakers.company')}</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} tabIndex={5} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="socialLinks.linkedin"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('speakers.linkedin')}</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ''} tabIndex={6} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="socialLinks.twitter"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('speakers.twitter')}</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ''} tabIndex={7} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('speakers.bio')}</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                value={field.value || ''}
                                className="min-h-[100px] resize-y"
                                tabIndex={8}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <RoomSelector form={form} rooms={rooms} />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting} tabIndex={10}>
                        {isSubmitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {currentSpeaker ? t('speakers.save') : t('speakers.create')}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          <SpeakerList
            speakers={filteredSpeakers}
            eventId={eventId}
            rooms={rooms}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function SpeakerManagement(props: SpeakerManagementProps) {
  return (
    <Suspense>
      <SpeakerManagementContent {...props} />
    </Suspense>
  );
}
