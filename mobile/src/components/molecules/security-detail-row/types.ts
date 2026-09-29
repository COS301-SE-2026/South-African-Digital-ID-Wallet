import type { LucideIcon } from 'lucide-react-native'

import type { StatusBadgeTone } from '../status-badge'

export type SecurityDetailRowProps = {
  badge?: { label: string; tone: StatusBadgeTone }
  hint?: string
  Icon: LucideIcon
  label: string
  testID?: string
  value: string
}
