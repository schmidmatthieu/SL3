"use client";

import { Room } from '@/types/room';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RoomPreview } from '@/components/events/room-preview';
import { StatusBadge } from '@/components/events/status-badge';
import { Users, Shield, Mic } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RoomCardProps {
  room: Room;
  eventId: string;
}

export function RoomCard({ room, eventId }: RoomCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/events/${eventId}/rooms/${room.id}`);
  };

  const handleAccessClick = (e: React.MouseEvent, type: 'mod' | 'speaker') => {
    e.stopPropagation();
    router.push(`/events/${eventId}/rooms/${room.id}/${type}`);
  };

  return (
    <Card 
      className="overflow-hidden transition-all hover:shadow-lg cursor-pointer group"
      onClick={handleClick}
    >
      <CardHeader className="p-0">
        <RoomPreview
          status={room.status}
          thumbnail={room.thumbnail}
          title={room.title}
        />
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg line-clamp-1">{room.title}</h3>
            <StatusBadge status={room.status} />
          </div>
          
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <div>
              {room.startTime} - {room.endTime}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{room.participants}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {room.languages.map((lang) => (
                <Badge key={lang} variant="secondary" className="text-xs">
                  {lang.toUpperCase()}
                </Badge>
              ))}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Shield className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => handleAccessClick(e, 'mod')}>
                  <Shield className="h-4 w-4 mr-2" />
                  Moderator View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleAccessClick(e, 'speaker')}>
                  <Mic className="h-4 w-4 mr-2" />
                  Speaker View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}