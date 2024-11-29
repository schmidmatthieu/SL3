"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';

const HOURS = Array.from({ length: 10 }, (_, i) => i + 9); // 9am to 6pm

interface TimelineProps {
  onTimeSelect: (hour: number) => void;
  selectedHour: number;
}

export function Timeline({ onTimeSelect, selectedHour }: TimelineProps) {
  return (
    <div className="flex items-center space-x-2 p-4 overflow-x-auto">
      {HOURS.map((hour) => {
        const timeString = `${hour}:00`;
        const isSelected = hour === selectedHour;
        
        return (
          <button
            key={hour}
            onClick={() => onTimeSelect(hour)}
            className={cn(
              "min-w-[100px] p-2 rounded-md text-sm transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {timeString}
          </button>
        );
      })}
    </div>
  );
}