import { z } from 'zod'

export const updatePasswordSchema = z
  .object({
    confirmPassword: z.string({ error: 'Confirm your new password.' }),
    currentPassword: z
      .string({ error: 'Enter your current password.' })
      .min(1, { error: 'Enter your current password.' }),
    newPassword: z
      .string({ error: 'Enter a new password.' })
      .min(8, { error: 'Use at least 8 characters.' }),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    error: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export const verifyPasswordSchema = z.object({
  password: z
    .string({ error: 'Enter your password.' })
    .min(1, { error: 'Enter your password.' }),
})

export const newEmailSchema = z.object({
  newEmail: z
    .string({ error: 'Enter your new email address.' })
    .trim()
    .pipe(z.email({ error: 'Enter a valid email address.' })),
})

export const emailOtpSchema = z.object({
  otp: z
    .string({ error: 'Enter the code.' })
    .trim()
    .length(6, { error: 'The code is 6 digits.' }),
})

export type VerifyPasswordFormData = z.infer<typeof verifyPasswordSchema>
export type NewEmailFormData = z.infer<typeof newEmailSchema>
export type EmailOtpFormData = z.infer<typeof emailOtpSchema>
export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>
