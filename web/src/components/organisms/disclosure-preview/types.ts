import type { QrDisclosureSelection } from '@/services/qr-service'

export type DisclosurePreviewProps = {
  selection: QrDisclosureSelection
  onConfirm: () => void
  onBack: () => void
}
