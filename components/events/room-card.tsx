'use client';

import { Room, ROOM_STATUS_TRANSLATIONS } from '@/types/room';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Mic, Clock, MessageCircle, Video, Globe2, Settings, Wrench } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const DEFAULT_ROOM_IMAGE = 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2000&auto=format&fit=crop';

const LANGUAGES = {
  fr: 'Français',
  en: 'English',
  de: 'Deutsch',
  it: 'Italiano',
};

interface RoomCardProps {
  room: Room;
  eventId: string;
  userLanguage?: keyof typeof ROOM_STATUS_TRANSLATIONS.upcoming;
}

const getStatusColor = (status: Room['status']) => {
  switch (status) {
    case 'live':
      return 'bg-third text-black';
    case 'upcoming':
      return 'bg-blue-500 text-white dark:bg-blue-600';
    case 'paused':
      return 'bg-yellow-500 text-black';
    case 'ended':
      return 'bg-secondary text-black';
    case 'cancelled':
      return 'bg-destructive text-destructive-foreground dark:bg-destructive/90';
    default:
      return 'bg-secondary text-black';
  }
};

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export function RoomCard({ room, eventId, userLanguage = 'en' }: RoomCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (room.status === 'cancelled') {
      return;
    }
    router.push(`/events/${eventId}/rooms/${room._id}`);
  };

  const handleAccessClick = (e: React.MouseEvent, type: 'mod' | 'speaker') => {
    e.stopPropagation();
    if (type === 'mod' || room.status !== 'cancelled') {
      router.push(`/events/${eventId}/rooms/${room._id}/${type}`);
    }
  };

  const statusTranslation = ROOM_STATUS_TRANSLATIONS[room.status]?.[userLanguage] || room.status;

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all card-hover-effect",
        room.status === 'cancelled'
          ? "cursor-not-allowed opacity-60" 
          : "cursor-pointer",
        "bg-background/40 backdrop-blur-[12px]",
        "border-primary-100/30 dark:border-primary-800/30",
        "hover:bg-primary-50/20 dark:hover:bg-primary-950/20",
        "hover:shadow-[0_0_15px_-5px_hsl(var(--primary-200))]",
        "dark:hover:shadow-[0_0_15px_-5px_hsl(var(--primary-800))]"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <div className="relative w-full h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent transition-opacity duration-300 group-hover:opacity-0" />
          <img
            src={room.thumbnail || DEFAULT_ROOM_IMAGE}
            alt={room.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <Badge
            className={cn(
              "absolute top-4 right-4",
              "transition-all duration-300",
              "group-hover:scale-105 font-medium",
              getStatusColor(room.status)
            )}
          >
            {statusTranslation}
          </Badge>

          <div className="absolute bottom-4 right-4 opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="group/settings relative bg-background/80 backdrop-blur-sm hover:bg-background/90 hover:scale-105 transition-all border-primary-100/30 dark:border-primary-800/30"
                >
                  <Settings className="h-4 w-4 text-primary-600 dark:text-primary-400 transition-transform duration-300 group-hover/settings:rotate-90" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={(e) => handleAccessClick(e, 'mod')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Accès modérateur</span>
                </DropdownMenuItem>
                {room.status !== 'cancelled' && (
                  <DropdownMenuItem onClick={(e) => handleAccessClick(e, 'speaker')}>
                    <Mic className="mr-2 h-4 w-4" />
                    <span>Accès speaker</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
              {room.name}
            </h3>
            <p className="text-primary-600/70 dark:text-primary-300/70 line-clamp-2 text-sm">
              {room.description}
            </p>
          </div>

          <Separator className="mb-4" />

          <div className="grid gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted/50">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">
                  {formatTime(room.startTime)} - {formatTime(room.endTime)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted/50">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">
                  {room.participants?.length || 0} / {room.settings?.maxParticipants || "∞"} participants
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted/50">
                <Globe2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex flex-1 min-w-0 gap-2 flex-wrap">
                {room.settings?.originalLanguage && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1 bg-blue-100/50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    <span className="font-semibold">VO:</span> {LANGUAGES[room.settings.originalLanguage as keyof typeof LANGUAGES] || room.settings.originalLanguage}
                  </Badge>
                )}
                {room.settings?.availableLanguages?.map((lang) => (
                  <Badge key={lang} variant="outline" className="text-xs bg-muted/30 text-muted-foreground hover:bg-muted/40">
                    {LANGUAGES[lang as keyof typeof LANGUAGES] || lang}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted/50">
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex flex-1 min-w-0 gap-2">
                {room.settings?.chatEnabled && (
                  <Badge className="text-xs flex items-center gap-1 bg-muted/30 text-muted-foreground">
                    <MessageCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                    CHAT
                  </Badge>
                )}
                {room.settings?.recordingEnabled && (
                  <Badge className="text-xs flex items-center gap-1 bg-muted/30 text-muted-foreground">
                    <Video className="h-3 w-3 text-red-600 dark:text-red-400" />
                    REC
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}