import type { QrDisclosureSelection } from '@/services/qr-service'

export type FieldSelectionFormProps = {
  credentialId: string
  onContinue: (selection: QrDisclosureSelection) => void
}
