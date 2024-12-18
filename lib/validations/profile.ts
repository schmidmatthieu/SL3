import * as z from 'zod';

export const profileFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  bio: z.string().optional(),
  preferredLanguage: z.string().default('en'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  imageUrl: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
