'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Search, Settings, Users } from 'lucide-react';

import { rooms } from '@/lib/rooms';
import { Badge } from '@/components/core/ui/badge';
import { Button } from '@/components/core/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/core/ui/card';
import { Input } from '@/components/core/ui/input';
import { ScrollArea } from '@/components/core/ui/scroll-area';

interface RoomOverviewProps {
  eventId: string;
}

export function RoomOverview({ eventId }: RoomOverviewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRooms = rooms.filter(room =>
    room.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: rooms.length,
    live: rooms.filter(r => r.status === 'live').length,
    upcoming: rooms.filter(r => r.status === 'upcoming').length,
    issues: 2,
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Live Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.live}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{stats.upcoming}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{stats.issues}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Room Status</CardTitle>
            <Input
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="max-w-xs"
              prefix={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {filteredRooms.map(room => (
                <Card key={room.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{room.title}</h3>
                          <Badge
                            variant={
                              room.status === 'live'
                                ? 'default'
                                : room.status === 'upcoming'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {room.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{room.participants}</span>
                          </div>
                          <span>
                            {room.startTime} - {room.endTime}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {room.status === 'live' && room.participants > 1000 && (
                          <Badge variant="secondary" className="bg-yellow-500/20">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            High Load
                          </Badge>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/events/${eventId}/rooms/${room.id}/mod`}>
                            <Settings className="h-4 w-4 mr-2" />
                            Manage
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
