'use client';

import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/core/ui/dialog';
import { ImageUploader } from '@/components/core/ui/image-uploader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/core/ui/avatar';
import { cn } from '@/lib/utils';
import { mediaService } from '@/lib/api/media';

interface SpeakerImageDialogProps {
  imageUrl?: string;
  firstName?: string;
  lastName?: string;
  speakerId?: string;
  onImageUpdate: (url: string) => void;
}

export function SpeakerImageDialog({
  imageUrl,
  firstName,
  lastName,
  speakerId,
  onImageUpdate
}: SpeakerImageDialogProps) {
  const { t } = useTranslation('event-settings');
  const fullImageUrl = mediaService.getImageUrl(imageUrl || '');

  const handleImageSelect = (url: string) => {
    // Utiliser l'URL complète de l'API pour les images
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const imageUrl = url.startsWith('http') ? url : `${apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    onImageUpdate(imageUrl);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Avatar className="h-16 w-16 border-2 border-primary/20 cursor-pointer hover:border-primary/40 transition-colors">
          {fullImageUrl ? (
            <AvatarImage src={fullImageUrl} alt={`${firstName} ${lastName}`} className="object-cover" />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-primary text-lg">
            {firstName?.[0]}
            {lastName?.[0]}
          </AvatarFallback>
        </Avatar>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>{t('eventSettings.speakers.image.update')}</DialogTitle>
          <DialogDescription>
            {t('eventSettings.speakers.image.updateDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <ImageUploader
            currentImage={fullImageUrl}
            onImageSelect={handleImageSelect}
            mediaType="speaker"
            entityId={speakerId}
            entityName={`${firstName} ${lastName}`}
            size="md"
            className="w-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
