'use client';

import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { ImageUploader } from '@/components/ui/image-uploader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

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
  const { t } = useTranslation('components/event-manage');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Avatar className="h-16 w-16 border-2 border-primary/20 cursor-pointer hover:border-primary/40 transition-colors">
          {imageUrl ? (
            <AvatarImage src={imageUrl} className="object-cover" />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-primary text-lg">
            {firstName?.[0]}
            {lastName?.[0]}
          </AvatarFallback>
        </Avatar>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>{t('speakers.updatePhoto')}</DialogTitle>
          <DialogDescription>
            {t('speakers.updatePhotoDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <ImageUploader
            currentImage={imageUrl}
            onImageSelect={(url) => {
              onImageUpdate(url);
            }}
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
