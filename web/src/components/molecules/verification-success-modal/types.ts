import { LucideIcon } from 'lucide-react'

export type CredentialVariant = 'id-document' | 'drivers-licence'

export type CredentialConfig = {
  icon: LucideIcon
  label: string
}

export type VerificationSuccessModalProps = {
  open: boolean
  variant: CredentialVariant
  fullName: string
  credentialValue: string
  onContinueAction: () => void
  onDismissAction: () => void
}
