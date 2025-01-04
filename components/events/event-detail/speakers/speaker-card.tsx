'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Linkedin, Twitter } from 'lucide-react';

import { Speaker } from '@/types/speaker';
import { Room } from '@/types/room';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SpeakerModal } from './speaker-modal';

interface SpeakerCardProps {
  speaker: Speaker;
  rooms: Room[];
}

export function SpeakerCard({ speaker, rooms }: SpeakerCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Obtenir le nombre de sessions
  const sessionCount = rooms.filter(room => room.speakers?.includes(speaker.id)).length;

  return (
    <>
      <Card
        className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <CardContent className="p-0">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={speaker.imageUrl || '/images/default-speaker.jpg'}
              alt={speaker.fullName}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
            
            {/* Liens sociaux */}
            <div className="absolute top-4 right-4 flex gap-2">
              {speaker.socialLinks?.linkedin && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="w-8 h-8 bg-black/20 backdrop-blur-sm hover:bg-black/40"
                  asChild
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <a
                    href={speaker.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {speaker.socialLinks?.twitter && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="w-8 h-8 bg-black/20 backdrop-blur-sm hover:bg-black/40"
                  asChild
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <a
                    href={speaker.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>

            {/* Informations du speaker */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="text-lg font-semibold leading-tight mb-1">
                {speaker.fullName}
              </h3>
              <p className="text-sm text-white/80">
                {speaker.role} {speaker.company ? `@ ${speaker.company}` : ''}
              </p>
            </div>
          </div>

          {/* Bio preview et badge de sessions */}
          <div className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {speaker.bio}
            </p>
            {sessionCount > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                {sessionCount} session{sessionCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <SpeakerModal
        speaker={speaker}
        rooms={rooms}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
