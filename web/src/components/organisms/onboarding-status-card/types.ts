import { IdentityRecord } from '@/types'

export type OnboardingStatusCardProps = {
  record: IdentityRecord | null
  idConsent: boolean
  contactDetailsConsent: boolean
  phone: string
  email: string
  accountCreated: boolean
  activationSent: boolean
  errors: Record<string, string>
  setErrors: (r: Record<string, string>) => void
}
