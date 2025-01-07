'use client';

import { useEffect, useState } from 'react';
import { useRoomStore } from '@/lib/store/room.store';
import { useSpeakerStore } from '@/lib/store/speaker.store';
import { addHours, format } from 'date-fns';
import { Settings } from 'lucide-react';

import { Room } from '@/types/room';
import { Speaker } from '@/types/speaker';
import { Button } from '@/components/core/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/core/ui/dialog';
import { ImageUploader } from '@/components/core/ui/image-uploader';
import { Input } from '@/components/core/ui/input';
import { Label } from '@/components/core/ui/label';
import { useToast } from '@/components/core/ui/use-toast';
import { Option } from '@/components/core/ui/multi-select';
import { RoomSettingsForm } from './RoomSettingsForm';
import { RoomDateTimePicker } from './RoomDateTimePicker';
import { RoomSpeakersSelect } from './RoomSpeakersSelect';

interface EditRoomDialogProps {
  room: Room;
  onClose?: () => void;
}

export function EditRoomDialog({ room: initialRoom, onClose }: EditRoomDialogProps) {
  const [open, setOpen] = useState(false);
  const roomStore = useRoomStore();
  const room = roomStore.selectedRoom || initialRoom;

  const [name, setName] = useState(room.name);
  const [capacity, setCapacity] = useState(room.settings.maxParticipants?.toString() || '');
  const [description, setDescription] = useState(room.description || '');
  const [thumbnail, setThumbnail] = useState(room.thumbnail || '');
  const [startDate, setStartDate] = useState<Date>(new Date(room.startTime));
  const [endDate, setEndDate] = useState<Date>(new Date(room.endTime));
  const [startTime, setStartTime] = useState(format(new Date(room.startTime), 'HH:mm'));
  const [endTime, setEndTime] = useState(format(new Date(room.endTime), 'HH:mm'));
  const [isPublic, setIsPublic] = useState(room.settings.isPublic);
  const [chatEnabled, setChatEnabled] = useState(room.settings.chatEnabled);
  const [recordingEnabled, setRecordingEnabled] = useState(room.settings.recordingEnabled);
  const [allowQuestions, setAllowQuestions] = useState(room.settings.allowQuestions);
  const [originalLanguage, setOriginalLanguage] = useState(room.settings.originalLanguage || 'fr');
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(
    room.settings.availableLanguages || [],
  );
  const [selectedSpeakers, setSelectedSpeakers] = useState<Option[]>(
    (room.speakers || []).map(id => ({ value: id, label: id }))
  );

  const { toast } = useToast();
  const { getSpeakers } = useSpeakerStore();
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (roomStore.selectedRoom) {
      const room = roomStore.selectedRoom;
      setName(room.name);
      setCapacity(room.settings.maxParticipants?.toString() || '');
      setDescription(room.description || '');
      setThumbnail(room.thumbnail || '');
      setStartDate(new Date(room.startTime));
      setEndDate(new Date(room.endTime));
      setStartTime(format(new Date(room.startTime), 'HH:mm'));
      setEndTime(format(new Date(room.endTime), 'HH:mm'));
      setIsPublic(room.settings.isPublic);
      setChatEnabled(room.settings.chatEnabled);
      setRecordingEnabled(room.settings.recordingEnabled);
      setAllowQuestions(room.settings.allowQuestions);
      setOriginalLanguage(room.settings.originalLanguage || 'fr');
      setAvailableLanguages(room.settings.availableLanguages || []);
      setSelectedSpeakers(
        (room.speakers || []).map(id => ({ value: id, label: id }))
      );
    }
  }, [roomStore.selectedRoom]);

  useEffect(() => {
    const loadSpeakers = async () => {
      if (!room.eventId) return;
      
      setIsLoading(true);
      try {
        const eventSpeakers = await getSpeakers(room.eventId);
        const speakersFromStore = useSpeakerStore.getState().speakers;
        setSpeakers(speakersFromStore);
        
        if (speakersFromStore?.length > 0) {
          setSelectedSpeakers(
            (room.speakers || []).map(id => {
              const speaker = speakersFromStore.find(s => s._id === id);
              return {
                value: id,
                label: speaker ? `${speaker.firstName} ${speaker.lastName}` : id
              };
            })
          );
        }
      } catch (error) {
        console.error('Failed to load speakers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load speakers',
          variant: 'destructive',
        });
        setSpeakers([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSpeakers();
  }, [room.eventId, getSpeakers, toast]);

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      setStartDate(date);
      if (endDate < date) {
        setEndDate(addHours(date, 1));
      }
    }
  };

  const handleStartTimeChange = (time: string) => {
    setStartTime(time);
    const [hours, minutes] = time.split(':').map(Number);
    const newStartDate = new Date(startDate);
    newStartDate.setHours(hours, minutes);

    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const newEndDate = new Date(endDate);
    newEndDate.setHours(endHours, endMinutes);

    if (newEndDate <= newStartDate) {
      const autoEndDate = addHours(newStartDate, 1);
      setEndTime(format(autoEndDate, 'HH:mm'));
      setEndDate(autoEndDate);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!room._id) {
        toast({
          title: 'Erreur',
          description: 'ID de la salle manquant',
          variant: 'destructive',
        });
        return;
      }

      const startDateTime = new Date(startDate);
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes);

      const endDateTime = new Date(endDate);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes);

      await roomStore.updateRoom(room._id, {
        name,
        description,
        thumbnail,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        settings: {
          isPublic,
          chatEnabled,
          recordingEnabled,
          allowQuestions,
          originalLanguage,
          availableLanguages,
          maxParticipants: parseInt(capacity) || undefined,
        },
        speakers: selectedSpeakers.map(s => s.value)
      });

      toast({
        title: 'Succès',
        description: 'Salle mise à jour avec succès',
      });

      setOpen(false);
      if (onClose) onClose();
    } catch (error) {
      console.error('Error updating room:', error);
      toast({
        title: 'Erreur',
        description: `Impossible de mettre à jour la salle: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      roomStore.setSelectedRoom(initialRoom);
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Room</DialogTitle>
          <DialogDescription>Update the room&apos;s details and settings</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="thumbnail" className="text-right">
              Thumbnail
            </Label>
            <div className="col-span-3">
              <ImageUploader
                onImageSelect={setThumbnail}
                currentImage={thumbnail}
                className="w-full"
              />
            </div>
          </div>

          <RoomSpeakersSelect
            speakers={speakers}
            selectedSpeakers={selectedSpeakers}
            isLoading={isLoading}
            onChange={setSelectedSpeakers}
          />

          <RoomSettingsForm
            isPublic={isPublic}
            chatEnabled={chatEnabled}
            recordingEnabled={recordingEnabled}
            allowQuestions={allowQuestions}
            capacity={capacity}
            onIsPublicChange={setIsPublic}
            onChatEnabledChange={setChatEnabled}
            onRecordingEnabledChange={setRecordingEnabled}
            onAllowQuestionsChange={setAllowQuestions}
            onCapacityChange={setCapacity}
          />

          <RoomDateTimePicker
            startDate={startDate}
            endDate={endDate}
            startTime={startTime}
            endTime={endTime}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={setEndDate}
            onStartTimeChange={handleStartTimeChange}
            onEndTimeChange={setEndTime}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
