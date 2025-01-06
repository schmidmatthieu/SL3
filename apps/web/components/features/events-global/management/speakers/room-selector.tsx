'use client';

import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Room } from '@/types/room';
import { Checkbox } from '@/components/core/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/core/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { SpeakerFormValues } from './types';
import { ScrollArea } from '@/components/core/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/core/ui/alert';

interface RoomSelectorProps {
  rooms: Room[];
  form: UseFormReturn<SpeakerFormValues>;
}

export function RoomSelector({ rooms, form }: RoomSelectorProps) {
  const { t } = useTranslation('components/event-manage');
  const fieldId = useId();

  const handleRoomChange = (room: Room, checked: boolean, onChange: (value: string[]) => void, currentValue: string[] = []) => {
    const roomId = room._id || room.id;
    if (!roomId) {
      console.error('Room has no ID:', room);
      return;
    }
    
    const newValue = checked
      ? [...currentValue, roomId]
      : currentValue.filter((id: string) => id !== roomId);
    
    console.log('Room change:', { roomId, checked, newValue });
    onChange(newValue);
  };

  return (
    <FormField
      control={form.control}
      name="rooms"
      render={({ field }) => {
        const selectedRooms = field.value || [];
        console.log('Selected rooms:', selectedRooms);
        console.log('Available rooms:', rooms);
        
        if (!rooms || rooms.length === 0) {
          return (
            <FormItem>
              <FormLabel>{t('speakers.form.rooms')}</FormLabel>
              <Alert>
                <AlertDescription>
                  {t('speakers.noRooms')}
                </AlertDescription>
              </Alert>
            </FormItem>
          );
        }
        
        return (
          <FormItem>
            <FormLabel>{t('speakers.form.rooms')}</FormLabel>
            <FormControl>
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rooms.map((room) => {
                    const roomId = room._id || room.id;
                    if (!roomId) return null;
                    
                    const checkboxId = `${fieldId}-room-${roomId}`;
                    const isSelected = selectedRooms.includes(roomId);
                    
                    console.log('Room:', { roomId, isSelected });
                    
                    return (
                      <div key={roomId} className="flex items-center space-x-2">
                        <Checkbox
                          id={checkboxId}
                          checked={isSelected}
                          onCheckedChange={(checked) => handleRoomChange(room, checked as boolean, field.onChange, selectedRooms)}
                        />
                        <label
                          htmlFor={checkboxId}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {room.name}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </FormControl>
          </FormItem>
        );
      }}
    />
  );
}
