import type { LucideIcon } from 'lucide-react-native'

import type { IconTileTone } from '@/components/atoms'

import type { StatusBadgeTone } from '../status-badge'

export type SecurityActivityRowProps = {
  badge?: { label: string; tone: StatusBadgeTone } | null
  description?: string
  Icon: LucideIcon
  onPress?: () => void
  testID?: string
  timestamp: string
  title: string
  tone: IconTileTone
}
