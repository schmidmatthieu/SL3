import * as z from 'zod'

export const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, { message: 'Username must be at least 2 characters.' })
    .max(30, { message: 'Username must not be longer than 30 characters.' }),
  email: z
    .string()
    .min(1, { message: 'This field cannot be empty.' })
    .email('This is not a valid email.'),
  bio: z
    .string()
    .max(160, { message: 'Bio must not be longer than 160 characters.' })
    .optional(),
  avatar_url: z.string().optional(),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>
