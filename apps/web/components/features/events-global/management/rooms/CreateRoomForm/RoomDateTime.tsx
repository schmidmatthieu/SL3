'use client';

import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/core/ui/button';
import { Calendar } from '@/components/core/ui/calendar';
import { Input } from '@/components/core/ui/input';
import { Label } from '@/components/core/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/core/ui/popover';
import { cn } from '@/lib/utils';
import { useRoomDateTime } from '@/hooks/useRoomDateTime';

interface RoomDateTimeProps {
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
}

export function RoomDateTime({
  onStartDateChange: onStartDateChangeProps,
  onEndDateChange: onEndDateChangeProps,
  onStartTimeChange: onStartTimeChangeProps,
  onEndTimeChange: onEndTimeChangeProps,
}: RoomDateTimeProps) {
  const {
    startDate,
    endDate,
    startTime,
    endTime,
    handleStartDateChange,
    handleEndDateChange,
    handleStartTimeChange,
    handleEndTimeChange
  } = useRoomDateTime();

  // Propager les changements aux props parents
  const onStartDateChangeHandler = (date: Date | undefined) => {
    handleStartDateChange(date);
    onStartDateChangeProps(date);
  };

  const onEndDateChangeHandler = (date: Date | undefined) => {
    handleEndDateChange(date);
    onEndDateChangeProps(date);
  };

  const onStartTimeChangeHandler = (time: string) => {
    handleStartTimeChange(time);
    onStartTimeChangeProps(time);
  };

  const onEndTimeChangeHandler = (time: string) => {
    handleEndTimeChange(time);
    onEndTimeChangeProps(time);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Start Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
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
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={onStartDateChangeHandler}
              initialFocus
              disabled={date => date < new Date()}
            />
          </PopoverContent>
        </Popover>
        <Input
          type="time"
          value={startTime}
          onChange={e => onStartTimeChangeHandler(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>End Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
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
              onSelect={onEndDateChangeHandler}
              initialFocus
              disabled={date => date < startDate}
            />
          </PopoverContent>
        </Popover>
        <Input
          type="time"
          value={endTime}
          onChange={e => onEndTimeChangeHandler(e.target.value)}
        />
      </div>
    </div>
  );
}
