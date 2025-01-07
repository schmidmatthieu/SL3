'use client';

import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Room } from '@/types/room';
import { FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/core/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { SpeakerFormValues } from './types';
import { Label } from '@/components/core/ui/label';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface RoomSelectorProps {
  rooms: Room[];
  form: UseFormReturn<SpeakerFormValues>;
}

export function RoomSelector({ form, rooms }: RoomSelectorProps) {
  const { t } = useTranslation('event-settings');

  if (!rooms || rooms.length === 0) {
    return (
      <div className="space-y-2">
        <Label>{t('eventSettings.speakers.form.rooms')}</Label>
        <p className="text-sm text-muted-foreground">
          {t('eventSettings.speakers.form.noRooms')}
        </p>
      </div>
    );
  }

  return (
    <FormField
      control={form.control}
      name="rooms"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t('eventSettings.speakers.form.rooms')}</FormLabel>
          <FormDescription>
            {t('eventSettings.speakers.form.roomsDescription')}
          </FormDescription>
          <FormControl>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => {
                const isSelected = field.value?.includes(room.id);
                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => {
                      const newValue = isSelected
                        ? field.value?.filter(id => id !== room.id)
                        : [...(field.value || []), room.id];
                      field.onChange(newValue);
                    }}
                    className={cn(
                      "relative p-4 rounded-lg border-2 text-left transition-all",
                      "hover:border-primary hover:shadow-md",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{room.name}</h3>
                        {room.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {room.description}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
