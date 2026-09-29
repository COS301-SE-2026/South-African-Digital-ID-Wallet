import type { SupportItem } from '@/config/support'

export type InfoSheetProps = {
  isVisible: boolean
  items: SupportItem[]
  onClose: () => void
  subtitle?: string
  testID?: string
  title: string
}
