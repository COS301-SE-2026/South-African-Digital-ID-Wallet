import { z } from 'zod'

export const citizenLookupSchema = z.object({
  saId: z
    .string()
    .trim()
    .regex(/^\d{13}$/, {
      error: 'Enter a valid 13 digit South African ID number.',
    }),
})

export const issueCredentialSchema = z.object({
  consentGiven: z.literal(true, {
    error: "Citizen consent is required before issuing a driver's licence.",
  }),
  credentialType: z.enum(['DriversLicense', 'IdentityDocument']),
  saId: z
    .string()
    .trim()
    .regex(/^\d{13}$/, {
      error: 'Enter a valid 13 digit South African ID number.',
    }),
})

export type CitizenLookupFormData = z.infer<typeof citizenLookupSchema>
export type IssueCredentialFormData = z.infer<typeof issueCredentialSchema>
