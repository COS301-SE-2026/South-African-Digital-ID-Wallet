import { IdentityRecord } from '@/types'

export type CaptureContactDetailsProps = {
  record: IdentityRecord | null
  phone: string
  setPhone: (v: string) => void
  email: string
  setEmail: (v: string) => void
  contactDetailsConsent: boolean
  setContactConsent: (v: boolean) => void
  idConsent: boolean
  createPendingAccount: () => void
  accountCreated: boolean
  sendActivationCode: () => void
}
