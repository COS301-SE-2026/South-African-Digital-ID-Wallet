import { IdentityRecord } from '@/types'

export type OnboardingStatusCardProps = {
  record: IdentityRecord | null
  idConsent: boolean
  accountCreated: boolean
  activationSent: boolean
}
