'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/core/ui/button';
import { RoomControlsProps } from '@/types/room-management.types';
import { EditRoomDialog } from '../edit-room-dialog';
import { StatusActions } from './StatusActions';

export function RoomControls({
  room,
  onStreamControl,
  onStatusChange,
  onDelete,
}: RoomControlsProps) {
  return (
    <div className="flex flex-col gap-2">
      <EditRoomDialog room={room} />
      <StatusActions
        room={room}
        onStreamControl={onStreamControl}
        onStatusChange={onStatusChange}
      />
      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
        onClick={() => onDelete(room._id)}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </Button>
    </div>
  );
}
