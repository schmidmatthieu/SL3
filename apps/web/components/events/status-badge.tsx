import { RoomStatus } from '@/types/room';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: RoomStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'h-2.5 w-2.5 rounded-full',
          status === 'live' && 'bg-green-500 animate-pulse',
          status === 'upcoming' && 'bg-blue-500',
          status === 'ended' && 'bg-gray-500',
          status === 'off' && 'bg-slate-300'
        )}
      />
      <span
        className={cn(
          'text-sm font-medium',
          status === 'live' && 'text-green-500',
          status === 'upcoming' && 'text-blue-500',
          status === 'ended' && 'text-gray-500',
          status === 'off' && 'text-slate-500'
        )}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
}
