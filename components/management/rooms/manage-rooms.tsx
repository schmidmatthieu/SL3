'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { addHours, format } from 'date-fns';
import {
  CalendarIcon,
  Clock,
  MessageCircle,
  Pause,
  Play,
  Plus,
  Power,
  RefreshCw,
  Square,
  Trash2,
  Users,
  Video,
  X,
} from 'lucide-react';

import { Room, RoomStatus } from '@/types/room';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ImageUploader } from '@/components/ui/image-uploader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { RoomStatusBadge } from '@/components/room/room-status-badge';

import { useRoomSync } from '../../../hooks/useRoomSync';
import { useRoomStore } from '../../../store/room.store';
import { EditRoomDialog } from './edit-room-dialog';

const AVAILABLE_LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
];

export function ManageRooms({ eventId }: { eventId: string }) {
  const roomStore = useRoomStore();
  const roomSync = useRoomSync(eventId);
  const { rooms, fetchEventRooms } = roomSync;
  const { createRoom } = roomStore;

  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCapacity, setNewRoomCapacity] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState(
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2000&auto=format&fit=crop'
  );
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addHours(new Date(), 1));
  const [startTime, setStartTime] = useState(format(new Date(), 'HH:mm'));
  const [endTime, setEndTime] = useState(format(addHours(new Date(), 1), 'HH:mm'));
  const [isPublic, setIsPublic] = useState(true);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [recordingEnabled, setRecordingEnabled] = useState(true);
  const [originalLanguage, setOriginalLanguage] = useState('fr');
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
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

  const handleCreateRoom = async () => {
    if (newRoomName && newRoomCapacity && startDate && endDate) {
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);

        start.setHours(startHours, startMinutes);
        end.setHours(endHours, endMinutes);

        await createRoom({
          name: newRoomName,
          eventId,
          description,
          thumbnail,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          status: 'upcoming',
          settings: {
            isPublic,
            chatEnabled,
            recordingEnabled,
            maxParticipants: parseInt(newRoomCapacity),
            allowQuestions: true,
            originalLanguage,
            availableLanguages,
          },
        });

        // Reset form
        setNewRoomName('');
        setNewRoomCapacity('');
        setDescription('');
        setThumbnail(
          'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2000&auto=format&fit=crop'
        );
        setStartDate(new Date());
        setEndDate(addHours(new Date(), 1));
        setStartTime(format(new Date(), 'HH:mm'));
        setEndTime(format(addHours(new Date(), 1), 'HH:mm'));
        setAvailableLanguages([]);

        // Forcer un rafraîchissement des rooms
        await fetchEventRooms(eventId);

        toast({
          title: 'Success',
          description: 'Room created successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to create room: ' + error.message,
          variant: 'destructive',
        });
      }
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    await roomSync.deleteRoom(eventId, roomId);
  };

  const handleStreamControl = async (
    roomId: string,
    action: 'start' | 'pause' | 'stop' | 'end'
  ) => {
    try {
      const room = rooms.find(r => r._id === roomId);
      if (!room) return;

      switch (action) {
        case 'start':
          await roomSync.startStream(roomId);
          break;
        case 'pause':
          await roomSync.pauseStream(roomId);
          break;
        case 'stop':
          await roomSync.stopStream(roomId);
          break;
        case 'end':
          await roomSync.endStream(roomId);
          break;
      }

      toast({
        title: 'Success',
        description: `Stream ${action}ed successfully`,
      });
    } catch (error) {
      console.error(`Error ${action}ing stream:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${action} stream: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleRoomStatusChange = async (roomId: string, status: RoomStatus) => {
    try {
      if (status === 'cancelled') {
        await roomSync.cancelRoom(roomId);
      } else if (status === 'upcoming') {
        await roomSync.reactivateRoom(roomId);
      } else {
        await roomSync.updateRoom(roomId, { status });
      }

      toast({
        title: 'Success',
        description: `Room status updated to ${status}`,
      });
    } catch (error) {
      console.error('Error updating room status:', error);
      toast({
        title: 'Error',
        description: `Failed to update room status: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMM yyyy HH:mm');
  };

  const getStatusActions = (room: Room) => {
    switch (room.status) {
      case 'live':
        return (
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStreamControl(room._id, 'pause')}
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStreamControl(room._id, 'end')}
            >
              <Power className="w-4 h-4 mr-2" />
              End
            </Button>
          </div>
        );
      case 'paused':
        return (
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStreamControl(room._id, 'start')}
            >
              <Play className="w-4 h-4 mr-2" />
              Resume
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStreamControl(room._id, 'end')}
            >
              <Power className="w-4 h-4 mr-2" />
              End
            </Button>
          </div>
        );
      case 'upcoming':
        return (
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStreamControl(room._id, 'start')}
            >
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRoomStatusChange(room._id, 'cancelled')}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        );
      case 'cancelled':
        return (
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRoomStatusChange(room._id, 'upcoming')}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reactivate
            </Button>
          </div>
        );
      case 'ended':
        return (
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRoomStatusChange(room._id, 'upcoming')}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reactivate
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  if (roomSync.isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Room</CardTitle>
          <CardDescription>Configure and add a new room to your event</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Room name"
                value={newRoomName}
                onChange={e => setNewRoomName(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Max capacity"
                value={newRoomCapacity}
                onChange={e => setNewRoomCapacity(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Input
                placeholder="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
              <div className="space-y-2">
                <Label>Image de couverture</Label>
                <ImageUploader
                  currentImage={thumbnail}
                  onImageSelect={setThumbnail}
                  mediaType="room"
                  entityId={eventId}
                  entityName={newRoomName}
                />
              </div>
            </div>

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
                      onSelect={handleStartDateChange}
                      initialFocus
                      disabled={date => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  value={startTime}
                  onChange={e => handleStartTimeChange(e.target.value)}
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
                      onSelect={setEndDate}
                      initialFocus
                      disabled={date => date < startDate}
                    />
                  </PopoverContent>
                </Popover>
                <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
                <Label htmlFor="public">Public Room</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="chat" checked={chatEnabled} onCheckedChange={setChatEnabled} />
                <Label htmlFor="chat">Enable Chat</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="recording"
                  checked={recordingEnabled}
                  onCheckedChange={setRecordingEnabled}
                />
                <Label htmlFor="recording">Enable Recording</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Original Language (VO)</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {originalLanguage}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {AVAILABLE_LANGUAGES.map(lang => (
                      <DropdownMenuItem
                        key={lang.code}
                        onSelect={e => {
                          e.preventDefault();
                          setOriginalLanguage(lang.code);
                        }}
                      >
                        {lang.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                <Label>Available Languages</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {availableLanguages.length
                        ? `${availableLanguages.length} languages selected`
                        : 'Select languages'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {AVAILABLE_LANGUAGES.map(lang => (
                      <DropdownMenuItem
                        key={lang.code}
                        disabled={lang.code === originalLanguage}
                        onSelect={e => {
                          e.preventDefault();
                          if (lang.code === originalLanguage) {
                            setAvailableLanguages(availableLanguages.filter(l => l !== lang.code));
                          } else if (!availableLanguages.includes(lang.code)) {
                            setAvailableLanguages([...availableLanguages, lang.code]);
                          } else {
                            setAvailableLanguages(availableLanguages.filter(l => l !== lang.code));
                          }
                        }}
                      >
                        <div className="flex items-center">
                          <div
                            className={cn(
                              'mr-2 h-4 w-4 rounded-sm border border-primary',
                              availableLanguages.includes(lang.code)
                                ? 'bg-primary'
                                : 'bg-transparent'
                            )}
                          />
                          {lang.label}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                {availableLanguages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableLanguages.map(lang => (
                      <Badge
                        key={lang}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() =>
                          setAvailableLanguages(availableLanguages.filter(l => l !== lang))
                        }
                      >
                        {AVAILABLE_LANGUAGES.find(l => l.code === lang)?.label}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button onClick={handleCreateRoom} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create Room
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Existing Rooms</CardTitle>
          <CardDescription>Control and configure your event rooms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rooms.map(room => (
              <div
                key={room._id}
                className={cn(
                  'rounded-lg p-4 border transition-colors',
                  'bg-card text-card-foreground',
                  'hover:bg-accent/5',
                  'dark:hover:bg-accent/10'
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted/20">
                      <img
                        src={room.thumbnail || '/placeholder.jpg'}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{room.name}</h3>
                      <p className="text-sm text-muted-foreground">{room.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <RoomStatusBadge status={room.status} />
                        {room.settings?.chatEnabled && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-muted/30 text-primary hover:bg-muted/40 dark:bg-muted/80 dark:text-primary dark:hover:bg-muted/90"
                          >
                            <MessageCircle className="w-3 h-3 mr-1" />
                            CHAT
                          </Badge>
                        )}
                        {room.settings?.recordingEnabled && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-muted/30 text-primary hover:bg-muted/40 dark:bg-muted/80 dark:text-primary dark:hover:bg-muted/90"
                          >
                            <Video className="w-3 h-3 mr-1" />
                            REC
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                        {formatDate(room.startTime)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                        {formatDate(room.endTime)}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <EditRoomDialog room={room} />
                      {getStatusActions(room)}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                        onClick={() => handleDeleteRoom(room._id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {rooms.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No rooms created yet. Create your first room above.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
