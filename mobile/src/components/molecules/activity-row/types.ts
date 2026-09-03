import type { LucideIcon } from 'lucide-react-native'

import type { IconTileShape, IconTileTone } from '@/components/atoms'

export type ActivityRowProps = {
  className?: string
  description?: string
  Icon: LucideIcon
  iconShape?: IconTileShape
  onPress?: () => void
  showChevron?: boolean
  testID?: string
  timestamp: string
  title: string
  tone?: IconTileTone
}
