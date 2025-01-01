'use client';

import { useState, useEffect } from 'react';
import { Room } from '@/types/room';
import { useRoomStore } from '@/store/room.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format, addHours } from 'date-fns';
import { CalendarIcon, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { ImageUploader } from '@/components/ui/image-uploader';

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
  const [originalLanguage, setOriginalLanguage] = useState(room.settings.originalLanguage);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(room.settings.availableLanguages);

  const { updateRoom } = useRoomStore();
  const { toast } = useToast();

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

  const handleSave = async () => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);
      
      start.setHours(startHours, startMinutes);
      end.setHours(endHours, endMinutes);

      // Ne mettre à jour que les champs qui ont été modifiés
      const updatedFields: any = {
        settings: {}
      };

      // Vérifier les changements dans les paramètres de settings
      let hasSettingsChanges = false;
      
      if (isPublic !== room.settings.isPublic) {
        updatedFields.settings.isPublic = isPublic;
        hasSettingsChanges = true;
      }
      if (chatEnabled !== room.settings.chatEnabled) {
        updatedFields.settings.chatEnabled = chatEnabled;
        hasSettingsChanges = true;
      }
      if (recordingEnabled !== room.settings.recordingEnabled) {
        updatedFields.settings.recordingEnabled = recordingEnabled;
        hasSettingsChanges = true;
      }
      if (parseInt(capacity) !== room.settings.maxParticipants) {
        updatedFields.settings.maxParticipants = parseInt(capacity);
        hasSettingsChanges = true;
      }
      if (originalLanguage !== room.settings.originalLanguage) {
        updatedFields.settings.originalLanguage = originalLanguage;
        hasSettingsChanges = true;
      }
      if (JSON.stringify(availableLanguages) !== JSON.stringify(room.settings.availableLanguages)) {
        updatedFields.settings.availableLanguages = availableLanguages;
        hasSettingsChanges = true;
      }

      // Ne pas envoyer settings s'il n'y a pas de changements
      if (!hasSettingsChanges) {
        delete updatedFields.settings;
      }

      // Vérifier les changements de champs basiques
      if (name !== room.name) {
        updatedFields.name = name;
      }
      
      if (description !== room.description) {
        updatedFields.description = description;
      }
      
      if (thumbnail !== room.thumbnail) {
        updatedFields.thumbnail = thumbnail;
      }

      // Vérifier les changements de dates
      const newStartTime = start.toISOString();
      const newEndTime = end.toISOString();
      
      if (newStartTime !== room.startTime) {
        updatedFields.startTime = newStartTime;
      }
      
      if (newEndTime !== room.endTime) {
        updatedFields.endTime = newEndTime;
      }

      // Ne pas envoyer de mise à jour si aucun champ n'a été modifié
      if (Object.keys(updatedFields).length === 0) {
        toast({
          title: "Information",
          description: "Aucun changement à sauvegarder",
        });
        return;
      }

      await updateRoom(room._id, updatedFields);
      
      toast({
        title: "Succès",
        description: "Room mise à jour avec succès",
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Error updating room:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour: " + error.message,
        variant: "destructive",
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
          <DialogDescription>
            Update the room&apos;s details and settings
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Room Name</Label>
              <Input
                placeholder="Room name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Capacity</Label>
              <Input
                type="number"
                placeholder="Max capacity"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Image de couverture</Label>
              <ImageUploader
                onImageSelect={setThumbnail}
                currentImage={thumbnail}
                mediaType="room"
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
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={handleStartDateChange}
                  />
                </PopoverContent>
              </Popover>
              <div className="mt-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
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
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date < startDate}
                  />
                </PopoverContent>
              </Popover>
              <div className="mt-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Public Room</Label>
              <Switch
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Enable Chat</Label>
              <Switch
                checked={chatEnabled}
                onCheckedChange={setChatEnabled}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Enable Recording</Label>
              <Switch
                checked={recordingEnabled}
                onCheckedChange={setRecordingEnabled}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
