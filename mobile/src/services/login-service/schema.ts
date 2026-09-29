import { z } from 'zod'

import { PASSWORD_RULES } from '@/services/register-service/password-rules'

const emailSchema = z
  .string({ error: 'Enter your email address.' })
  .trim()
  .pipe(z.email({ error: 'Enter a valid email address.' }))

const otpSchema = z
  .string({ error: 'Enter the 6-digit code.' })
  .trim()
  .regex(/^\d{6}$/, { error: 'Enter the 6-digit code from your email.' })

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string({ error: 'Enter your password.' })
    .min(1, { error: 'Enter your password.' }),
})

export const deviceVerificationSchema = z.object({
  otp: otpSchema,
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z
  .object({
    otp: otpSchema,
    newPassword: z
      .string({ error: 'Enter a new password.' })
      .superRefine((value, ctx) => {
        const unmet = PASSWORD_RULES.find((rule) => !rule.test(value))
        if (unmet) {
          ctx.addIssue({ code: 'custom', message: unmet.label })
        }
      }),
    confirmPassword: z.string({ error: 'Re-enter your new password.' }),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    error: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export type DeviceVerificationFormData = z.infer<
  typeof deviceVerificationSchema
>
export type LoginFormData = z.infer<typeof loginSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
