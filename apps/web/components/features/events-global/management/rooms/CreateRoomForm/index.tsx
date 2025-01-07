'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/core/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/core/ui/card';
import { CreateRoomFormProps, CreateRoomFormData } from '@/types/room-management.types';
import { RoomBasicInfo } from './RoomBasicInfo';
import { RoomDateTime } from './RoomDateTime';
import { RoomSettings } from './RoomSettings';
import { RoomLanguages } from './RoomLanguages';
import { useState } from 'react';
import { addHours, format } from 'date-fns';
import { getDefaultRoomTimes, combineDateAndTime } from '@/lib/utils/room-datetime';

export function CreateRoomForm({ onSubmit, isLoading }: CreateRoomFormProps) {
  const defaultTimes = getDefaultRoomTimes();
  const [formData, setFormData] = useState<CreateRoomFormData>({
    name: '',
    capacity: '',
    description: '',
    thumbnail: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2000&auto=format&fit=crop',
    startDate: defaultTimes.startDate,
    endDate: defaultTimes.endDate,
    startTime: defaultTimes.startTime,
    endTime: defaultTimes.endTime,
    isPublic: true,
    chatEnabled: true,
    recordingEnabled: true,
    originalLanguage: 'fr',
    availableLanguages: [],
  });

  const handleSubmit = async () => {
    const startDateTime = combineDateAndTime(formData.startDate, formData.startTime);
    const endDateTime = combineDateAndTime(formData.endDate, formData.endTime);

    await onSubmit({
      ...formData,
      startDate: startDateTime,
      endDate: endDateTime,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Room</CardTitle>
        <CardDescription>Configure and add a new room to your event</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <RoomBasicInfo
            name={formData.name}
            capacity={formData.capacity}
            description={formData.description}
            thumbnail={formData.thumbnail}
            eventSlug={formData.eventSlug}
            onNameChange={name => setFormData({ ...formData, name })}
            onCapacityChange={capacity => setFormData({ ...formData, capacity })}
            onDescriptionChange={description => setFormData({ ...formData, description })}
            onThumbnailChange={thumbnail => setFormData({ ...formData, thumbnail })}
          />

          <RoomDateTime
            startDate={formData.startDate}
            endDate={formData.endDate}
            startTime={formData.startTime}
            endTime={formData.endTime}
            onStartDateChange={date => {
              if (date) {
                setFormData({ ...formData, startDate: date });
                if (formData.endDate < date) {
                  setFormData(prev => ({
                    ...prev,
                    endDate: addHours(date, 2)
                  }));
                }
              }
            }}
            onEndDateChange={date => date && setFormData({ ...formData, endDate: date })}
            onStartTimeChange={time => {
              setFormData({ ...formData, startTime: time });
              const startDateTime = combineDateAndTime(formData.startDate, time);
              const endDateTime = combineDateAndTime(formData.endDate, formData.endTime);

              if (endDateTime <= startDateTime) {
                const autoEndDate = addHours(startDateTime, 2);
                setFormData(prev => ({
                  ...prev,
                  endTime: format(autoEndDate, 'HH:mm'),
                  endDate: autoEndDate
                }));
              }
            }}
            onEndTimeChange={time => setFormData({ ...formData, endTime: time })}
          />

          <RoomSettings
            isPublic={formData.isPublic}
            chatEnabled={formData.chatEnabled}
            recordingEnabled={formData.recordingEnabled}
            onPublicChange={isPublic => setFormData({ ...formData, isPublic })}
            onChatChange={chatEnabled => setFormData({ ...formData, chatEnabled })}
            onRecordingChange={recordingEnabled => setFormData({ ...formData, recordingEnabled })}
          />

          <RoomLanguages
            originalLanguage={formData.originalLanguage}
            availableLanguages={formData.availableLanguages}
            onOriginalLanguageChange={originalLanguage => setFormData({ ...formData, originalLanguage })}
            onAvailableLanguagesChange={availableLanguages => setFormData({ ...formData, availableLanguages })}
          />

          <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
            <Plus className="w-4 h-4 mr-2" />
            Create Room
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
