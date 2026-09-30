import { z } from 'zod'
import { saIdSchema } from './sa-id'

export const citizenLookupSchema = z.object({
  // Same shared SA ID rule as onboarding
  saId: saIdSchema,
})

export const issueCredentialSchema = z.object({
  consentGiven: z.literal(true, {
    error: "Citizen consent is required before issuing a driver's licence.",
  }),
  credentialType: z.enum(['DriversLicense', 'IdentityDocument']),
  saId: saIdSchema,
})

export type CitizenLookupFormData = z.infer<typeof citizenLookupSchema>
export type IssueCredentialFormData = z.infer<typeof issueCredentialSchema>
