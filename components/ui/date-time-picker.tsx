'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface DateTimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  className?: string;
}

export function DateTimePicker({ value, onChange, className }: DateTimePickerProps) {
  // Initialize state with value prop
  const [date, setDate] = React.useState<Date | undefined>(value);
  const [time, setTime] = React.useState(value ? format(value, 'HH:mm') : '12:00');

  // Update local state when value prop changes
  React.useEffect(() => {
    setDate(value);
    setTime(value ? format(value, 'HH:mm') : '12:00');
  }, [value]);

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      const [hours, minutes] = time.split(':').map(Number);
      const updatedDate = new Date(newDate);
      updatedDate.setHours(hours || 0);
      updatedDate.setMinutes(minutes || 0);
      onChange?.(updatedDate);
    } else {
      onChange?.(undefined);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);
    
    if (date && newTime) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const updatedDate = new Date(date);
      updatedDate.setHours(hours || 0);
      updatedDate.setMinutes(minutes || 0);
      onChange?.(updatedDate);
    }
  };

  return (
    <div className={cn('flex gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[240px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'PPP') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        value={time}
        onChange={handleTimeChange}
        className="w-fit hover:cursor-pointer"
      />
    </div>
  );
}
