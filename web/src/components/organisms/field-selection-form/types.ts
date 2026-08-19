import type {
  QrDisclosureSelection,
  CredentialType,
} from '@/services/qr-service'

export type FieldSelectionFormProps = {
  credentialId: string
  credentialType: CredentialType
  onBack: () => void
  onContinue: (selection: QrDisclosureSelection) => void
  onSelectionChange?: (selection: QrDisclosureSelection) => void
  continueLabel?: string
}
