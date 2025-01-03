'use client';

import { Type, Info, Image } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUploader } from '@/components/ui/image-uploader';
import { Switch } from '@/components/ui/switch';
import { Event } from '@/types/event';
import { EventFormData } from '../types/event-settings.types';
import { useTranslation } from 'react-i18next';
import '@/app/i18n/client';

interface EventBasicInfoProps {
  formData: EventFormData;
  setFormData: (data: EventFormData) => void;
  event: Event;
  onFeaturedChange: (featured: boolean) => void;
}

export function EventBasicInfo({ formData, setFormData, event, onFeaturedChange }: EventBasicInfoProps) {
  const { t } = useTranslation('management/settings/event-settings');

  return (
    <Card className="w-full border border-primary-200 dark:border-primary-800 shadow-sm">
      <CardContent className="space-y-8 pt-6">
        {/* Featured Section */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-primary-100/50 dark:bg-primary-900/50 border border-primary-200 dark:border-primary-700">
          <Label htmlFor="featured" className="flex flex-col cursor-pointer">
            <span className="font-medium text-primary-900 dark:text-primary-100">
              {t('eventSettings.basicInfo.featured.title')}
            </span>
            <span className="text-sm text-primary-700 dark:text-primary-300">
              {t('eventSettings.basicInfo.featured.description')}
            </span>
          </Label>
          <Switch
            id="featured"
            checked={formData.featured}
            onCheckedChange={checked => {
              setFormData(prev => ({ ...prev, featured: checked }));
              onFeaturedChange(checked);
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
              {t('eventSettings.basicInfo.title')}
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="border-primary-100/30 dark:border-primary-800/30 focus:border-primary-500"
              placeholder={t('eventSettings.basicInfo.titlePlaceholder')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-primary-900 dark:text-primary-100 flex items-center gap-2"
            >
              <Info className="w-4 h-4" />
              {t('eventSettings.basicInfo.description')}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[120px] border-primary-100/30 dark:border-primary-800/30 focus:border-primary-500"
              placeholder={t('eventSettings.basicInfo.descriptionPlaceholder')}
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-medium text-primary-900 dark:text-primary-100 flex items-center gap-2">
              <Image className="w-4 h-4" />
              {t('eventSettings.basicInfo.image')}
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
  );
}
