'use client';

import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { Linkedin, Twitter } from 'lucide-react';

import { Speaker } from '@/types/speaker';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface SpeakersProps {
  speakers: Speaker[];
}

export function Speakers({ speakers }: SpeakersProps) {
  const { t } = useTranslation('components/event-detail');

  if (!speakers.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {t('speakers.noSpeakers')}
      </div>
    );
  }

  return (
    <section className="py-12">
      <div className="container">
        <h2 className="text-2xl font-semibold tracking-tight mb-8">
          {t('speakers.title')}
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {speakers.map((speaker) => (
            <Card
              key={speaker.id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                  {speaker.imageUrl ? (
                    <Image
                      src={speaker.imageUrl}
                      alt={`${speaker.firstName} ${speaker.lastName}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-xl font-semibold">
                      {speaker.firstName[0]}
                      {speaker.lastName[0]}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold truncate">
                        {speaker.firstName} {speaker.lastName}
                      </h3>
                      {(speaker.role || speaker.company) && (
                        <p className="text-sm text-muted-foreground truncate">
                          {speaker.role}
                          {speaker.role && speaker.company && ' @ '}
                          {speaker.company}
                        </p>
                      )}
                    </div>

                    {speaker.socialLinks && (
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          {speaker.socialLinks.linkedin && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <a
                                  href={speaker.socialLinks.linkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-primary"
                                >
                                  <Linkedin className="h-4 w-4" />
                                  <span className="sr-only">LinkedIn</span>
                                </a>
                              </TooltipTrigger>
                              <TooltipContent>LinkedIn</TooltipContent>
                            </Tooltip>
                          )}

                          {speaker.socialLinks.twitter && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <a
                                  href={speaker.socialLinks.twitter}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-primary"
                                >
                                  <Twitter className="h-4 w-4" />
                                  <span className="sr-only">Twitter</span>
                                </a>
                              </TooltipTrigger>
                              <TooltipContent>Twitter</TooltipContent>
                            </Tooltip>
                          )}
                        </TooltipProvider>
                      </div>
                    )}
                  </div>

                  {speaker.bio && (
                    <p className="mt-2 text-sm line-clamp-2">{speaker.bio}</p>
                  )}

                  {speaker.sessions && speaker.sessions.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {speaker.sessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between gap-2 text-sm"
                        >
                          <span className="truncate flex-1">{session.title}</span>
                          <Badge variant="outline" className="flex-shrink-0">
                            {session.time}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
