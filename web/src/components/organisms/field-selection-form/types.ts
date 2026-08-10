import type {
  QrDisclosureSelection,
  CredentialType,
} from '@/services/qr-service'

export type FieldSelectionFormProps = {
  credentialId: string
  credentialType: CredentialType
  onBack: () => void
  onContinue: (selection: QrDisclosureSelection) => void
}
