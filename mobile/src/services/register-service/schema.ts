import { z } from 'zod'

import { PASSWORD_RULES } from './password-rules'

const passwordSchema = z
  .string({ error: 'Enter a password.' })
  .superRefine((value, ctx) => {
    const unmet = PASSWORD_RULES.find((rule) => !rule.test(value))
    if (unmet) {
      ctx.addIssue({ code: 'custom', message: unmet.label })
    }
  })

export const registerSchema = z
  .object({
    email: z
      .string({ error: 'Enter your email address.' })
      .trim()
      .pipe(z.email({ error: 'Enter a valid email address.' })),
    password: passwordSchema,
    confirmPassword: z.string({ error: 'Re-enter your password.' }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    error: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export const verifyEmailSchema = z.object({
  otp: z
    .string({ error: 'Enter the 6-digit code.' })
    .trim()
    .regex(/^\d{6}$/, { error: 'Enter the 6-digit code from your email.' }),
})

export type RegisterFormData = z.infer<typeof registerSchema>
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>
