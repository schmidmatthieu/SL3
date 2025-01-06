'use client';

import { useEffect, useState } from 'react';
import { useRoomStore } from '@/lib/store/room.store';
import { useSpeakerStore } from '@/lib/store/speaker.store';
import { addHours, format } from 'date-fns';
import { CalendarIcon, Settings } from 'lucide-react';

import { Room } from '@/types/room';
import { Speaker } from '@/types/speaker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/core/ui/button';
import { Calendar } from '@/components/core/ui/calendar';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/core/ui/popover';
import { Switch } from '@/components/core/ui/switch';
import { useToast } from '@/components/core/ui/use-toast';
import { MultiSelect, Option } from '@/components/core/ui/multi-select';

const AVAILABLE_LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
];

interface EditRoomDialogProps {
  room: Room;
  onClose?: () => void;
}

export function EditRoomDialog({ room, onClose }: EditRoomDialogProps) {
  const [open, setOpen] = useState(false);
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
  const { updateRoom } = useRoomStore();
  const { getSpeakers } = useSpeakerStore();
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadSpeakers = async () => {
      if (!room.eventId) return;
      
      setIsLoading(true);
      try {
        const eventSpeakers = await getSpeakers(room.eventId);
        // Utiliser directement les speakers du store
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
      // Met à jour la date de fin si elle est avant la nouvelle date de début
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

    // Met à jour l'heure de fin si nécessaire
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

    const startDateTime = new Date(startDate);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes);

    const endDateTime = new Date(endDate);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes);

    try {
      await updateRoom(room._id, {
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
          maxParticipants: capacity ? parseInt(capacity) : undefined,
          originalLanguage,
          availableLanguages,
        },
        speakers: selectedSpeakers.map(s => s.value),
      });

      toast({
        title: 'Success',
        description: 'Room updated successfully',
      });

      setOpen(false);
      onClose?.();
    } catch (error) {
      console.error('Failed to update room:', error);
      toast({
        title: 'Error',
        description: 'Failed to update room',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
                onImageSelected={setThumbnail}
                currentImage={thumbnail}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="speakers" className="text-right">
              Speakers
            </Label>
            <div className="col-span-3">
              <MultiSelect
                id="speakers"
                isLoading={isLoading}
                options={speakers?.map(speaker => ({
                  value: speaker._id,
                  label: `${speaker.firstName} ${speaker.lastName}`,
                })) || []}
                value={selectedSpeakers}
                onChange={setSelectedSpeakers}
                placeholder="Select speakers..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Capacity</Label>
              <Input
                type="number"
                placeholder="Max capacity"
                value={capacity}
                onChange={e => setCapacity(e.target.value)}
              />
            </div>
          </div>

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
                  <Calendar mode="single" selected={startDate} onSelect={handleStartDateChange} />
                </PopoverContent>
              </Popover>
              <div className="mt-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={e => handleStartTimeChange(e.target.value)}
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
                    onSelect={setEndDate}
                    disabled={date => date < startDate}
                  />
                </PopoverContent>
              </Popover>
              <div className="mt-2">
                <Label>End Time</Label>
                <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Public Room</Label>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Enable Chat</Label>
              <Switch checked={chatEnabled} onCheckedChange={setChatEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Enable Recording</Label>
              <Switch checked={recordingEnabled} onCheckedChange={setRecordingEnabled} />
            </div>
          </div>
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
