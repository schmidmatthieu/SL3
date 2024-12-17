'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/auth-store';
import { useEvents } from '@/hooks/useEvents';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/store/event.store';
import { Settings, Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2000&auto=format&fit=crop';

interface EventCardProps {
  event: Event;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-500 hover:bg-green-600';
    case 'scheduled':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'ended':
      return 'bg-gray-500 hover:bg-gray-600';
    default:
      return 'bg-gray-500 hover:bg-gray-600';
  }
};

const getDisplayStatus = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'Live';
    case 'scheduled':
      return 'Scheduled';
    case 'ended':
      return 'Ended';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export function EventCard({ event }: EventCardProps) {
  const { user, profile } = useAuthStore();
  const isAdmin = profile?.role === 'admin';
  const isEventAdmin = user?.id === event.createdBy;
  const canManageEvent = isAdmin || isEventAdmin;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all",
        "bg-background/40 backdrop-blur-[12px] border-primary/10",
        "hover:bg-background/60 hover:shadow-[0_0_30px_-5px_rgba(var(--primary),.2)]",
        "dark:bg-background/20 dark:border-primary/20",
        "dark:hover:bg-background/30 dark:hover:shadow-[0_0_30px_-5px_rgba(var(--primary),.3)]"
      )}
    >
      <Link href={`/events/${event.id}`}>
        <CardContent className="p-0">
          <div className="relative w-full h-48 overflow-hidden">
            <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 group-hover:opacity-0" />
            <img
              src={event.imageUrl || DEFAULT_EVENT_IMAGE}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <Badge
              className={cn(
                "absolute top-4 right-4 transition-transform duration-300 group-hover:scale-105",
                getStatusColor(event.status)
              )}
            >
              {getDisplayStatus(event.status)}
            </Badge>
          </div>
          
          <div className="p-6">
            <div className="space-y-2 mb-6">
              <h3 className="text-xl font-semibold tracking-tight transition-colors group-hover:text-primary">
                {event.title}
              </h3>
              <p className="text-muted-foreground line-clamp-2">
                {event.description}
              </p>
            </div>

            <Separator className="mb-6" />

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Start Date</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {format(new Date(event.startDateTime), 'PPP')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">End Date</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {format(new Date(event.endDateTime), 'PPP')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Rooms</p>
                  <p className="text-sm text-muted-foreground">
                    {event.rooms} {event.rooms === 1 ? 'room' : 'rooms'} available
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 right-6 opacity-0 transform translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
              <ArrowRight className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Link>
      
      {canManageEvent && (
        <div className="absolute top-4 left-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Link href={`/events/${event.id}/manage`} passHref>
            <Button
              variant="outline"
              size="sm"
              className="bg-background/80 backdrop-blur-sm hover:bg-background/90 border-background"
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}