import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.email({ error: 'Enter a valid email address.' })),
  password: z.string().min(1, { error: 'Enter your password.' }),
})

export type LoginFormData = z.infer<typeof loginSchema>
