import type { QrCredentialType } from '@/services/qr-service'

export type DisclosureModalProps = {
  credentialType: QrCredentialType
  isVisible: boolean
  onClose: () => void
  onConfirm: (selectedOptionalFields: string[]) => void
  testID?: string
}
