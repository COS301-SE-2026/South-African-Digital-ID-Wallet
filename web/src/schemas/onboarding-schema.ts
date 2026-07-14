import { z } from 'zod'

export const retrivalSchema = z.object({
  idNumber: z
    .string()
    .trim()
    .regex(/^\d{13}$/, {
      error: 'Enter a valid 13 digit South African ID number.',
    }),

  idConsent: z.literal(true, {
    error: 'Citizen consent is required before retreiving ID record.',
  }),
})

export const onboardingSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+27|0)[6-8][0-9]\d{8}$/),

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
