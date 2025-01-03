import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TIMELINE_CONFIG } from '../constants';
import { ViewMode } from '../types';

interface TimeSelectProps {
  currentHourStart: number;
  viewMode: ViewMode;
  navigateHours: (direction: 'forward' | 'backward') => void;
  setCurrentHourStart: (hour: number) => void;
}

export const TimeSelect = ({
  currentHourStart,
  viewMode,
  navigateHours,
  setCurrentHourStart,
}: TimeSelectProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigateHours('backward')}
        disabled={currentHourStart === 0}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Select
        value={currentHourStart.toString()}
        onValueChange={(value) => setCurrentHourStart(parseInt(value))}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue>
            {`${currentHourStart}h-${currentHourStart + TIMELINE_CONFIG[viewMode].hoursVisible}h`}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: Math.floor(24 / TIMELINE_CONFIG[viewMode].hoursVisible) }).map((_, i) => {
            const start = i * TIMELINE_CONFIG[viewMode].hoursVisible;
            const end = Math.min(start + TIMELINE_CONFIG[viewMode].hoursVisible, 24);
            return (
              <SelectItem key={start} value={start.toString()}>
                {`${start}h-${end}h`}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigateHours('forward')}
        disabled={currentHourStart >= 24 - TIMELINE_CONFIG[viewMode].hoursVisible}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
