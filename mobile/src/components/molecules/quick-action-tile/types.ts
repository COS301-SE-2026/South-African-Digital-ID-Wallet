import type { LucideIcon } from 'lucide-react-native'

import type { IconTileTone } from '@/components/atoms'

export type QuickActionTileProps = {
  className?: string
  Icon: LucideIcon
  label: string
  onPress: () => void
  testID?: string
  tone?: IconTileTone
}
