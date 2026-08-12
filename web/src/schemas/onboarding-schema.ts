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

export const contactDetailsSchema = z.object({
  contactDetailsConsent: z.boolean().refine((value) => value, {
    error: 'Citizen consent is required to capture contact details.',
  }),
  email: z
    .string()
    .trim()
    .pipe(z.email({ error: 'Enter a valid email address.' })),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+27[678]\d{8}|0[678]\d{8})$/, {
      error: 'Enter a valid South African mobile number.',
    }),
})

export type ContactDetailsFormData = z.infer<typeof contactDetailsSchema>
export type RetriveIDRecordFormData = z.infer<typeof retrivalSchema>
