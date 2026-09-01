import type { CitizenCredentialStatus, IssuedCredential } from '@/types'

export type IssueCredentialFormProps = {
  citizen: CitizenCredentialStatus | null
  className?: string
  consentGiven: boolean
  errors: Record<string, string>
  hasActiveLicense: boolean
  isPending: boolean
  issued: IssuedCredential | null
  onIssue: () => void
  setConsentGiven: (consentGiven: boolean) => void
  setErrors: (errors: Record<string, string>) => void
}
