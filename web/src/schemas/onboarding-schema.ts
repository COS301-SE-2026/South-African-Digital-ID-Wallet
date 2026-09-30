import { z } from 'zod'
import { saIdSchema } from './sa-id'

export const retrivalSchema = z.object({
  // Full SA ID check (date, citizenship digit, Luhn), not just "13 digits"
  idNumber: saIdSchema,

  idConsent: z.literal(true, {
    error: 'Citizen consent is required before retreiving ID record.',
  }),
})

export const onboardingSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+27[678]\d{8}|0[678]\d{8})$/, {
      error:
        'Enter a valid South African mobile number.\n(e.g. +27612345678 or 0612345678).',
    }),

  email: z.string().trim().email({ error: 'Enter a valid email address.' }),

  contactDetailsConsent: z.literal(true, {
    error: 'Citizen consent is required to capture contact details.',
  }),

  idConsent: z.literal(true, {
    error: 'Citizen consent is required to retreive ID record.',
  }),
})

export type RetriveIDRecordFormData = z.infer<typeof retrivalSchema>
export type OnboardingFormData = z.infer<typeof onboardingSchema>
