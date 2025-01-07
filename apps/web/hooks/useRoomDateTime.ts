import { useState, useCallback } from 'react';
import { addHours, format } from 'date-fns';
import { getDefaultTimeRange } from '@/lib/utils/date-time';

export function useRoomDateTime() {
  const defaultTimes = getDefaultTimeRange();
  
  const [startDate, setStartDate] = useState<Date>(defaultTimes.startDate);
  const [endDate, setEndDate] = useState<Date>(defaultTimes.endDate);
  const [startTime, setStartTime] = useState(defaultTimes.startTime);
  const [endTime, setEndTime] = useState(defaultTimes.endTime);

  const handleStartDateChange = useCallback((date: Date | undefined) => {
    if (date) {
      setStartDate(date);
      if (endDate < date) {
        const newEndDate = addHours(date, 2);
        setEndDate(newEndDate);
        setEndTime(`${newEndDate.getHours().toString().padStart(2, '0')}:00`);
      }
    }
  }, [endDate]);

  const handleStartTimeChange = useCallback((time: string) => {
    setStartTime(time);
    const [hours, minutes] = time.split(':').map(Number);
    const newStartDate = new Date(startDate);
    newStartDate.setHours(hours, minutes);

    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const newEndDate = new Date(endDate);
    newEndDate.setHours(endHours, endMinutes);

    if (newEndDate <= newStartDate) {
      const autoEndDate = addHours(newStartDate, 2);
      setEndTime(format(autoEndDate, 'HH:mm'));
      setEndDate(autoEndDate);
    }
  }, [startDate, endDate, endTime]);

  const handleEndDateChange = useCallback((date: Date | undefined) => {
    if (date) {
      setEndDate(date);
    }
  }, []);

  const handleEndTimeChange = useCallback((time: string) => {
    setEndTime(time);
  }, []);

  return {
    startDate,
    endDate,
    startTime,
    endTime,
    handleStartDateChange,
    handleEndDateChange,
    handleStartTimeChange,
    handleEndTimeChange
  };
}
