import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Label } from '@/components/core/ui/label';
import { Button } from '@/components/core/ui/button';
import { Calendar } from '@/components/core/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/core/ui/popover';
import { Input } from '@/components/core/ui/input';
import { cn } from '@/lib/utils';

interface RoomDateTimePickerProps {
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

export function RoomDateTimePicker({
  startDate,
  endDate,
  startTime,
  endTime,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange,
}: RoomDateTimePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Start Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !startDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={startDate} onSelect={onStartDateChange} />
          </PopoverContent>
        </Popover>
        <div className="mt-2">
          <Label>Start Time</Label>
          <Input
            type="time"
            value={startTime}
            onChange={e => onStartTimeChange(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>End Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !endDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={onEndDateChange}
              disabled={date => date < startDate}
            />
          </PopoverContent>
        </Popover>
        <div className="mt-2">
          <Label>End Time</Label>
          <Input type="time" value={endTime} onChange={e => onEndTimeChange(e.target.value)} />
        </div>
      </div>
    </div>
  );
}
