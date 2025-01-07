import * as z from 'zod';
import { UseFormReturn } from 'react-hook-form';
import { Room as GlobalRoom } from '@/types/room';
import { Event } from '@/types/event';

export type Room = GlobalRoom;

export interface SpeakerManagementProps {
  event: Event;
  rooms: Room[];
}

export const speakerFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  role: z.string().optional(),
  company: z.string().optional(),
  bio: z.string().optional(),
  imageUrl: z.string().optional(),
  rooms: z.array(z.string()).default([]),
  socialLinks: z
    .object({
      linkedin: z.union([
        z.string().url().optional(),
        z.string().length(0),
        z.literal(''),
      ]).optional(),
      twitter: z.union([
        z.string().url().optional(),
        z.string().length(0),
        z.literal(''),
      ]).optional(),
    })
    .optional()
    .default({}),
});

export type SpeakerFormValues = z.infer<typeof speakerFormSchema>;

export interface Speaker {
  id: string;
  firstName?: string;
  lastName: string;
  role?: string;
  company?: string;
  bio?: string;
  imageUrl?: string;
  rooms?: string[];
  eventId?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
  };
}

export interface SpeakerFormProps {
  form: UseFormReturn<SpeakerFormValues>;
  onSubmit: (values: SpeakerFormValues) => Promise<void>;
  isSubmitting: boolean;
  currentSpeaker: Speaker | null;
  rooms: Room[];
}
