import type { QrDisclosureSelection } from '@/services/qr-service'

export type QrDisplayProps = {
  selection: QrDisclosureSelection
  onBack: () => void
}
