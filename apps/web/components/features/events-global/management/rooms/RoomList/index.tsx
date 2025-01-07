'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/core/ui/card';
import { RoomListProps } from '@/types/room-management.types';
import { RoomCard } from './RoomCard';

export function RoomList({
  rooms,
  onStreamControl,
  onStatusChange,
  onDelete,
}: RoomListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Existing Rooms</CardTitle>
        <CardDescription>Control and configure your event rooms</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rooms.map((room, index) => (
            <RoomCard
              key={`room-${room._id}-${index}`}
              room={room}
              onStreamControl={onStreamControl}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))}

          {rooms.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No rooms created yet. Create your first room above.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
