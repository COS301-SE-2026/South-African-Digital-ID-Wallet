import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string({ error: 'Enter your email address.' })
    .trim()
    .pipe(z.email({ error: 'Enter a valid email address.' })),
  password: z
    .string({ error: 'Enter your password.' })
    .min(1, { error: 'Enter your password.' }),
})

export type LoginFormData = z.infer<typeof loginSchema>
