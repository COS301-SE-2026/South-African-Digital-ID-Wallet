import type { ActivityRange } from '@/services/citizen-dashboard-service'

export type ActivityFilterSheetProps = {
  isVisible: boolean
  onClose: () => void
  onSelect: (range: ActivityRange) => void
  range: ActivityRange
  testID?: string
}
