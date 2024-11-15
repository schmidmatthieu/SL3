"use client";

import { Event } from '@/types/event';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Users, Shield } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const router = useRouter();

  const handleModClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/events/${event.id}/manage`);
  };

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover"
            />
            <Badge 
              className={`absolute top-4 right-4 ${
                event.status === 'live' ? 'bg-green-500' :
                event.status === 'upcoming' ? 'bg-blue-500' : 'bg-gray-500'
              }`}
              variant="secondary"
            >
              {event.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-lg line-clamp-1">{event.title}</h3>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleModClick}
            >
              <Shield className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{event.venue}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>{format(new Date(event.date), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{event.rooms} rooms</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}