'use client';

import { Suspense, useEffect, useState } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSpeakerStore } from '@/lib/store/speaker.store';
import { useToast } from '@/components/core/ui/use-toast';
import { BackButton } from '@/components/core/ui/back-button';
import { Button } from '@/components/core/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/core/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/core/ui/custom-dialog';
import { Input } from '@/components/core/ui/input';
import { Speaker } from '@/types/speaker';
import { SpeakerList } from './speaker-list';
import { SpeakerManagementProps, speakerFormSchema, SpeakerFormValues } from './types';
import { useTranslation } from 'react-i18next';
import '@/app/i18n/client';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/core/ui/form';
import { Textarea } from '@/components/core/ui/textarea';
import { RoomSelector } from './room-selector';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/core/ui/alert-dialog";

function SpeakerManagementContent({ event, rooms }: SpeakerManagementProps) {
  const { t } = useTranslation('event-settings');
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<Speaker | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [speakerToDelete, setSpeakerToDelete] = useState<string | null>(null);
  const { speakers, getSpeakers, createSpeaker, updateSpeaker, deleteSpeaker } = useSpeakerStore();

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
    if (event?.id) {
      getSpeakers(event.id);
    }
  }, [event?.id, getSpeakers]);

  const onSubmit = async (values: SpeakerFormValues) => {
    try {
      setIsSubmitting(true);

      if (currentSpeaker) {
        await updateSpeaker(event.id, currentSpeaker.id, {
          ...values,
          eventId: event.id,
        });
        toast({
          title: t('speakers.success.update'),
          description: t('speakers.success.updateDescription'),
        });
      } else {
        await createSpeaker(event.id, {
          ...values,
          eventId: event.id,
        });
        toast({
          title: t('speakers.success.add'),
          description: t('speakers.success.addDescription'),
        });
      }

      setOpen(false);
      form.reset();
      setCurrentSpeaker(null);
    } catch (error) {
      toast({
        title: t('speakers.error.title'),
        description: t('speakers.error.description'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setCurrentSpeaker(null);
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
    setOpen(newOpen);
  };

  const handleEditSpeaker = (speaker: Speaker) => {
    setCurrentSpeaker(speaker);
    form.reset({
      firstName: speaker.firstName || '',
      lastName: speaker.lastName,
      role: speaker.role || '',
      company: speaker.company || '',
      bio: speaker.bio || '',
      imageUrl: speaker.imageUrl || '',
      rooms: speaker.rooms || [],
      socialLinks: {
        linkedin: speaker.socialLinks?.linkedin || '',
        twitter: speaker.socialLinks?.twitter || '',
      },
    });
    setOpen(true);
  };

  const handleDeleteSpeaker = async (speakerId: string) => {
    setSpeakerToDelete(speakerId);
  };

  const confirmDelete = async () => {
    if (!speakerToDelete) return;

    try {
      await deleteSpeaker(event.id, speakerToDelete);
      toast({
        title: t('eventSettings.speakers.success.delete'),
        description: t('eventSettings.speakers.success.deleteDescription'),
      });
      await getSpeakers(event.id);
    } catch (error) {
      console.error('Error deleting speaker:', error);
      toast({
        title: t('eventSettings.speakers.error.delete'),
        description: t('eventSettings.speakers.error.deleteDescription'),
        variant: 'destructive',
      });
    } finally {
      setSpeakerToDelete(null);
    }
  };

  return (
    <Card className="container mt-8 pt-8 pb-4">
      <CardHeader>
        <CardTitle>{t('eventSettings.speakers.title')}</CardTitle>
        <CardDescription>
          {t('eventSettings.speakers.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between gap-4">
            <Dialog 
              open={open} 
              onOpenChange={handleOpenChange}
              modal={false}
            >
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setCurrentSpeaker(null);
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
                }}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t('eventSettings.speakers.add')}
                </Button>
              </DialogTrigger>
              <DialogContent 
                className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto"
                onEscapeKeyDown={(e) => {
                  e.preventDefault();
                  setOpen(false);
                }}
                onInteractOutside={(e) => {
                  e.preventDefault();
                  setOpen(false);
                }}
              >
                <DialogHeader className="select-none">
                  <DialogTitle>
                    {currentSpeaker ? t('speakers.editTitle') : t('speakers.addTitle')}
                  </DialogTitle>
                  <DialogDescription className="select-none">{t('speakers.formDescription')}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4" role="group">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="select-none">{t('speakers.firstName')}</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value || ''}
                                  className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                  onFocus={(e) => e.target.select()}
                                />
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
                              <FormLabel className="select-none">{t('speakers.lastName')}</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value || ''}
                                  className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                  onFocus={(e) => e.target.select()}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-4" role="group">
                        <FormField
                          control={form.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="select-none">{t('speakers.role')}</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value || ''}
                                  className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                  onFocus={(e) => e.target.select()}
                                />
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
                              <FormLabel className="select-none">{t('speakers.company')}</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value || ''}
                                  className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                  onFocus={(e) => e.target.select()}
                                />
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
                                <FormLabel className="select-none">{t('speakers.linkedin')}</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    value={field.value || ''}
                                    className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    onFocus={(e) => e.target.select()}
                                  />
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
                                <FormLabel className="select-none">{t('speakers.twitter')}</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    value={field.value || ''}
                                    className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    onFocus={(e) => e.target.select()}
                                  />
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
                            <FormLabel className="select-none">{t('speakers.bio')}</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                value={field.value || ''}
                                className="min-h-[100px] resize-y focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                onFocus={(e) => e.target.select()}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <RoomSelector form={form} rooms={rooms} />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting}>
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
            speakers={speakers}
            eventId={event.id}
            rooms={rooms}
            onEdit={handleEditSpeaker}
            onDelete={handleDeleteSpeaker}
          />
          <AlertDialog open={!!speakerToDelete} onOpenChange={() => setSpeakerToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('eventSettings.speakers.delete.title')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('eventSettings.speakers.delete.description')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {t('common.delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

export function SpeakerManagement({ event, rooms }: SpeakerManagementProps) {
  return (
    <Suspense>
      <SpeakerManagementContent event={event} rooms={rooms} />
    </Suspense>
  );
}
