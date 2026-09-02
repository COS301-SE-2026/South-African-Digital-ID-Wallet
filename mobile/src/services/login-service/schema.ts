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

export const deviceVerificationSchema = z.object({
  otp: z
    .string({ error: 'Enter the 6-digit code.' })
    .trim()
    .regex(/^\d{6}$/, { error: 'Enter the 6-digit code from your email.' }),
})

export type DeviceVerificationFormData = z.infer<
  typeof deviceVerificationSchema
>
export type LoginFormData = z.infer<typeof loginSchema>
