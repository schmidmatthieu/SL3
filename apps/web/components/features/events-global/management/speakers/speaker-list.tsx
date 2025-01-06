'use client';

import { useTranslation } from 'react-i18next';
import '@/app/i18n/client';
import { Briefcase, Linkedin, MoreVertical, Pencil, Settings, Trash, Twitter } from 'lucide-react';
import { Badge } from '@/components/core/ui/badge';
import { ScrollArea } from '@/components/core/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/core/ui/table';
import { Speaker } from '@/types/speaker';
import { Room } from './types';
import { SpeakerActions } from './speaker-actions';
import { cn } from '@/lib/utils';
import { useSpeakerStore } from '@/lib/store/speaker.store';
import { useToast } from '@/components/core/ui/use-toast';
import { SpeakerImageDialog } from './components/speaker-image-dialog';

interface SpeakerListProps {
  speakers: Speaker[];
  eventId: string;
  rooms: Room[];
  onEdit: (speaker: Speaker) => void;
  onDelete: (speakerId: string) => void;
}

const getStatusColor = (status: Room['status']) => {
  switch (status) {
    case 'live':
      return 'bg-third text-black';
    case 'upcoming':
      return 'bg-blue-500 text-white dark:bg-blue-600';
    case 'ended':
      return 'bg-gray-500 text-white dark:bg-gray-600';
    case 'cancelled':
      return 'bg-red-500 text-white dark:bg-red-600';
    case 'paused':
      return 'bg-yellow-500 text-black dark:bg-yellow-600';
    default:
      return 'bg-gray-500 text-white dark:bg-gray-600';
  }
};

export function SpeakerList({ speakers, eventId, rooms, onEdit, onDelete }: SpeakerListProps) {
  const { t } = useTranslation('components/event-manage');
  const { toast } = useToast();
  const { uploadImage } = useSpeakerStore();

  const handleImageUpdate = async (speaker: Speaker, url: string) => {
    try {
      if (!speaker?.id) {
        console.error('Speaker ID is undefined');
        toast({
          title: t('error'),
          description: t('speakers.photoError'),
          variant: 'destructive'
        });
        return;
      }

      // Convertir l'URL en File
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], 'speaker-image.jpg', { type: 'image/jpeg' });

      await uploadImage(eventId, speaker.id, file);
      toast({
        title: t('success'),
        description: t('speakers.photoUpdated')
      });
    } catch (error) {
      console.error('Error updating speaker image:', error);
      toast({
        title: t('error'),
        description: t('speakers.photoError'),
        variant: 'destructive'
      });
    }
  };

  if (speakers.length === 0) {
    return (
      <div className="flex justify-center items-center h-32">
        <p className="text-muted-foreground">{t('speakers.noSpeakers')}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] w-full rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary/5">
            <TableHead className="w-[250px]">{t('speakers.table.speaker')}</TableHead>
            <TableHead className="w-[200px]">{t('speakers.table.roleCompany')}</TableHead>
            <TableHead className="w-[200px]">{t('speakers.table.rooms')}</TableHead>
            <TableHead>{t('speakers.table.bio')}</TableHead>
            <TableHead className="w-[120px]">{t('speakers.table.social')}</TableHead>
            <TableHead className="w-[100px]">{t('speakers.table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {speakers.map(speaker => {
            return (
              <TableRow key={speaker.id} className="hover:bg-secondary/5">
                <TableCell className="flex items-center space-x-4">
                  <SpeakerImageDialog
                    imageUrl={speaker.imageUrl}
                    firstName={speaker.firstName}
                    lastName={speaker.lastName}
                    speakerId={speaker.id}
                    onImageUpdate={(url) => handleImageUpdate(speaker, url)}
                  />
                  <div>
                    <div className="font-medium text-primary">
                      {speaker.firstName} {speaker.lastName}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    {speaker.role && (
                      <div className="flex items-center text-sm font-medium dark:text-third text-primary">
                        <Briefcase className="mr-1 h-3 w-3" />
                        {speaker.role}
                      </div>
                    )}
                    {speaker.company && (
                      <div className="text-sm text-muted-foreground">{speaker.company}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(speaker.rooms || []).map(roomId => {
                      const room = (rooms || []).find(r => {
                        return r.id === roomId || r._id === roomId;
                      });
                      if (!room) return null;
                      return (
                        <Badge 
                          key={roomId} 
                          className={cn(
                            "whitespace-nowrap",
                            getStatusColor(room.status)
                          )}
                        >
                          {room.name}
                        </Badge>
                      );
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  {speaker.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2 max-w-[300px]">
                      {speaker.bio}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {speaker.socialLinks?.linkedin && (
                      <a
                        href={speaker.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    {speaker.socialLinks?.twitter && (
                      <a
                        href={speaker.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-500 hover:text-sky-700 transition-colors"
                      >
                        <Twitter className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(speaker)}
                      className="text-muted-foreground hover:text-primary/80 transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(speaker.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
