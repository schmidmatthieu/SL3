'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BackButton } from '@/components/ui/back-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Pencil, Trash2, UserPlus, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useSpeakerStore } from '@/store/speaker.store';
import { Speaker } from '@/types/speaker';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ImageUploader } from '@/components/ui/image-uploader';

interface Room {
  id: string;
  name: string;
}

interface SpeakerManagementProps {
  eventId: string;
  rooms: Room[];
}

const speakerFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  imageUrl: z.string().optional(),
  rooms: z.array(z.string()).optional().default([])
});

type SpeakerFormValues = z.infer<typeof speakerFormSchema>;

export function SpeakerManagement({ eventId, rooms }: SpeakerManagementProps) {
  const { toast } = useToast();
  const {
    speakers,
    error,
    getSpeakers,
    createSpeaker,
    updateSpeaker,
    deleteSpeaker,
  } = useSpeakerStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSpeaker, setCurrentSpeaker] = useState<Speaker | null>(null);

  const form = useForm<SpeakerFormValues>({
    resolver: zodResolver(speakerFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      imageUrl: '',
      rooms: [],
    },
  });

  useEffect(() => {
    getSpeakers(eventId);
  }, [eventId, getSpeakers]);

  useEffect(() => {
    if (currentSpeaker) {
      form.reset({
        firstName: currentSpeaker.firstName,
        lastName: currentSpeaker.lastName,
        imageUrl: currentSpeaker.imageUrl || '',
        rooms: currentSpeaker.rooms || [],
      });
    }
  }, [currentSpeaker, form]);

  const onSubmit = async (values: SpeakerFormValues) => {
    setIsSubmitting(true);
    try {
      if (currentSpeaker) {
        await updateSpeaker(eventId, currentSpeaker.id, values);
        toast({
          title: 'Success',
          description: 'Speaker updated successfully',
        });
      } else {
        await createSpeaker(eventId, {
          ...values,
          eventId,
          rooms: values.rooms || [],
        });
        toast({
          title: 'Success',
          description: 'Speaker created successfully',
        });
      }

      setIsAddDialogOpen(false);
      setCurrentSpeaker(null);
      form.reset();
    } catch (error) {
      console.error('Error submitting speaker:', error);
      toast({
        title: 'Error',
        description: 'Failed to save speaker',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSpeaker = async (speakerId: string) => {
    try {
      await deleteSpeaker(eventId, speakerId);
      toast({
        title: 'Success',
        description: 'Speaker deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete speaker',
        variant: 'destructive',
      });
    }
  };

  const filteredSpeakers = speakers.filter(
    (speaker) =>
      speaker.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      speaker.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="text-destructive">Failed to load speakers</p>
          <Button onClick={() => getSpeakers(eventId)}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <BackButton className="mb-6" />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Speaker Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage speakers for your event
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Speaker
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {currentSpeaker ? 'Edit Speaker' : 'Add New Speaker'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned Rooms</FormLabel>
                      <Select
                        value={field.value[0] || ''}
                        onValueChange={(value) =>
                          field.onChange([...field.value, value])
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select rooms" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {rooms.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              {room.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Photo</FormLabel>
                      <FormControl>
                        <ImageUploader
                          onImageSelect={(url) => field.onChange(url)}
                          currentImage={field.value}
                          mediaType="speaker"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {currentSpeaker ? 'Update' : 'Add'} Speaker
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Speakers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search speakers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <ScrollArea className="h-[600px] w-full">
            {speakers.length === 0 ? (
              <div className="flex justify-center items-center h-32">
                <p>No speakers found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Speaker</TableHead>
                    <TableHead>Rooms</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSpeakers.map((speaker) => (
                    <TableRow key={speaker.id}>
                      <TableCell className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={speaker.imageUrl} />
                          <AvatarFallback>
                            {speaker.firstName[0]}
                            {speaker.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {speaker.firstName} {speaker.lastName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {speaker.rooms
                          .map(
                            (roomId) =>
                              rooms.find((r) => r.id === roomId)?.name || roomId
                          )
                          .join(', ')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setCurrentSpeaker(speaker);
                              setIsAddDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Speaker
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this speaker?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteSpeaker(speaker.id)
                                  }
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
