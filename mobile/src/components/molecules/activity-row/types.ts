import type { LucideIcon } from 'lucide-react-native'

import type { IconTileTone } from '@/components/atoms'

export type ActivityRowProps = {
  className?: string
  description?: string
  Icon: LucideIcon
  onPress?: () => void
  testID?: string
  timestamp: string
  title: string
  tone?: IconTileTone
}
