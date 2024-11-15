"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Plus, Clock, Users } from 'lucide-react';

interface TimelineManagementProps {
  eventId: string;
}

interface ScheduledRoom {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  capacity: number;
  moderators: string[];
  hasConflict: boolean;
}

const mockSchedule: ScheduledRoom[] = [
  {
    id: '1',
    title: 'Opening Keynote',
    startTime: '09:00',
    endTime: '10:30',
    capacity: 500,
    moderators: ['John Doe', 'Jane Smith'],
    hasConflict: false,
  },
  {
    id: '2',
    title: 'Technical Workshop',
    startTime: '10:00',
    endTime: '11:30',
    capacity: 200,
    moderators: ['Alice Johnson'],
    hasConflict: true,
  },
  {
    id: '3',
    title: 'Panel Discussion',
    startTime: '13:00',
    endTime: '14:30',
    capacity: 300,
    moderators: ['Bob Wilson'],
    hasConflict: false,
  },
];

export function TimelineManagement({ eventId }: TimelineManagementProps) {
  const [schedule, setSchedule] = useState(mockSchedule);
  const [newRoom, setNewRoom] = useState({
    title: '',
    startTime: '',
    endTime: '',
    capacity: '',
  });

  const handleAddRoom = () => {
    const room: ScheduledRoom = {
      id: Date.now().toString(),
      title: newRoom.title,
      startTime: newRoom.startTime,
      endTime: newRoom.endTime,
      capacity: parseInt(newRoom.capacity),
      moderators: [],
      hasConflict: false,
    };

    // Check for time conflicts
    const hasConflict = schedule.some(
      (r) =>
        (room.startTime >= r.startTime && room.startTime < r.endTime) ||
        (room.endTime > r.startTime && room.endTime <= r.endTime)
    );

    setSchedule(prev => [...prev, { ...room, hasConflict }]);
    setNewRoom({ title: '', startTime: '', endTime: '', capacity: '' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Add New Room</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Input
              placeholder="Room Title"
              value={newRoom.title}
              onChange={(e) => setNewRoom(prev => ({ ...prev, title: e.target.value }))}
            />
            <Input
              type="time"
              value={newRoom.startTime}
              onChange={(e) => setNewRoom(prev => ({ ...prev, startTime: e.target.value }))}
            />
            <Input
              type="time"
              value={newRoom.endTime}
              onChange={(e) => setNewRoom(prev => ({ ...prev, endTime: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Capacity"
              value={newRoom.capacity}
              onChange={(e) => setNewRoom(prev => ({ ...prev, capacity: e.target.value }))}
            />
          </div>
          <Button
            className="mt-4"
            onClick={handleAddRoom}
            disabled={!newRoom.title || !newRoom.startTime || !newRoom.endTime || !newRoom.capacity}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Schedule</CardTitle>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Times</SelectItem>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {schedule.map((room) => (
                <Card key={room.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{room.title}</h3>
                          {room.hasConflict && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Time Conflict
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {room.startTime} - {room.endTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{room.capacity}</span>
                          </div>
                        </div>
                        {room.moderators.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            Moderators: {room.moderators.join(', ')}
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
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