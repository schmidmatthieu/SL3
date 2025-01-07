'use client';

import { useTranslation } from 'react-i18next';
import '@/app/i18n/client';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/core/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/core/ui/form';
import { Input } from '@/components/core/ui/input';
import { Textarea } from '@/components/core/ui/textarea';
import { SpeakerFormProps } from './types';
import { RoomSelector } from './room-selector';
import { toast } from '@/components/core/ui/toast';

export function SpeakerForm({ form, onSubmit, isSubmitting, currentSpeaker, rooms }: SpeakerFormProps) {
  const { t } = useTranslation('event-settings');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('eventSettings.speakers.form.firstName')}</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>{t('eventSettings.speakers.form.lastName')} *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('eventSettings.speakers.form.role')}</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>{t('eventSettings.speakers.form.company')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('eventSettings.speakers.form.bio')}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className="min-h-[100px] resize-y"
                  placeholder={t('eventSettings.speakers.form.bioPlaceholder')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <RoomSelector form={form} rooms={rooms} />
        <FormField
          control={form.control}
          name="socialLinks.linkedin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('eventSettings.speakers.form.linkedin')}</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>{t('eventSettings.speakers.form.twitter')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {currentSpeaker ? t('common.update') : t('common.add')}
        </Button>
      </form>
    </Form>
  );
}
