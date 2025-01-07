'use client';

import { Play, Pause, Power, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/core/ui/button';
import { Room, RoomStatus } from '@/types/room';

interface StatusActionsProps {
  room: Room;
  onStreamControl: (roomId: string | undefined, action: 'start' | 'pause' | 'stop' | 'end') => Promise<void>;
  onStatusChange: (roomId: string | undefined, status: RoomStatus) => Promise<void>;
}

export function StatusActions({ room, onStreamControl, onStatusChange }: StatusActionsProps) {
  const roomId = room?._id || room?.id;

  if (!room || !roomId) {
    console.error('Room or room ID is missing:', room);
    return (
      <div className="text-red-500 p-2 rounded bg-red-100/10">
        <p>ID de salle manquant.</p>
        <p className="text-sm">Veuillez rafraîchir la page.</p>
      </div>
    );
  }

  const handleAction = (action: 'start' | 'pause' | 'stop' | 'end') => {
    onStreamControl(roomId, action);
  };

  const handleStatusChange = (status: RoomStatus) => {
    onStatusChange(roomId, status);
  };

  switch (room.status) {
    case 'live':
      return (
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('pause')}
          >
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('end')}
          >
            <Power className="w-4 h-4 mr-2" />
            End
          </Button>
        </div>
      );
    case 'paused':
      return (
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('start')}
          >
            <Play className="w-4 h-4 mr-2" />
            Resume
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('end')}
          >
            <Power className="w-4 h-4 mr-2" />
            End
          </Button>
        </div>
      );
    case 'upcoming':
      return (
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('start')}
          >
            <Play className="w-4 h-4 mr-2" />
            Start
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusChange('cancelled')}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      );
    case 'cancelled':
    case 'ended':
      return (
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusChange('upcoming')}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reactivate
          </Button>
        </div>
      );
    default:
      return null;
  }
}
