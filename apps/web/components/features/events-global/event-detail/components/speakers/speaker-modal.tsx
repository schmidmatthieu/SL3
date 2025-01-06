'use client';

import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { X, Linkedin, Twitter, MapPin, Calendar, Clock } from 'lucide-react';
import Image from 'next/image';

import { Speaker } from '@/types/speaker';
import { Room } from '@/types/room';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/core/ui/dialog';
import { Button } from '@/components/core/ui/button';
import { ScrollArea } from '@/components/core/ui/scroll-area';
import { Separator } from '@/components/core/ui/separator';
import { RoomStatusBadge } from '@/components/features/rooms-global/room-detail/room-status-badge';
import { cn } from '@/lib/utils';

interface SpeakerModalProps {
  speaker: Speaker;
  rooms: Room[];
  isOpen: boolean;
  onClose: () => void;
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export function SpeakerModal({ speaker, rooms, isOpen, onClose }: SpeakerModalProps) {
  const { t } = useTranslation('components/event-detail');
  const router = useRouter();

  // Filtrer les salles où le speaker intervient
  const speakerRooms = rooms.filter(room => room.speakers?.includes(speaker.id));

  const handleRoomClick = (roomId: string) => {
    router.push(`/rooms/${roomId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-background dark:bg-background-dark">
        <DialogHeader className="p-0">
          <DialogTitle className="sr-only">
            {speaker.fullName}
          </DialogTitle>
          {/* En-tête avec image de couverture et informations principales */}
          <div className="relative h-[300px] w-full bg-muted">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full max-h-[300px]">
                <Image
                  src={speaker.imageUrl || '/images/default-speaker.jpg'}
                  alt={speaker.fullName}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  priority
                />
                <div 
                  className="absolute inset-0" 
                  style={{ 
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.7) 100%)' 
                  }} 
                />
              </div>
            </div>

            {/* Informations principales */}
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h2 className="text-3xl font-bold mb-2">
                {speaker.fullName}
              </h2>
              <p className="text-lg text-white/90">
                {speaker.role} {speaker.company ? `@ ${speaker.company}` : ''}
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] overflow-auto">
          <div className="p-6 space-y-6">
            {/* Liens sociaux */}
            {(speaker.socialLinks?.linkedin || speaker.socialLinks?.twitter) && (
              <div className="flex gap-4">
                {speaker.socialLinks?.linkedin && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-primary hover:text-primary-dark"
                    asChild
                  >
                    <a
                      href={speaker.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                {speaker.socialLinks?.twitter && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-primary hover:text-primary-dark"
                    asChild
                  >
                    <a
                      href={speaker.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter className="h-4 w-4" />
                      Twitter
                    </a>
                  </Button>
                )}
              </div>
            )}

            {/* Biographie */}
            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {t('speakers.bio')}
              </h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {speaker.bio}
              </p>
            </div>

            {/* Sessions */}
            {speakerRooms.length > 0 && (
              <div>
                <Separator className="my-6" />
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  {t('speakers.sessions')}
                </h3>
                <div className="grid gap-4">
                  {speakerRooms.map(room => (
                    <div
                      key={room.id}
                      className={cn(
                        "p-4 rounded-lg border transition-colors",
                        "hover:bg-muted/50 cursor-pointer",
                        "dark:hover:bg-muted-foreground/10"
                      )}
                      onClick={() => handleRoomClick(room.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleRoomClick(room.id);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-medium text-foreground">
                            {room.name}
                          </h4>
                          {room.location && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {room.location}
                            </p>
                          )}
                        </div>
                        <RoomStatusBadge status={room.status} />
                      </div>
                      
                      {(room.startTime || room.endTime) && (
                        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                          {room.startTime && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(room.startTime)}
                            </span>
                          )}
                          {room.startTime && room.endTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(room.startTime)} - {formatTime(room.endTime)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
