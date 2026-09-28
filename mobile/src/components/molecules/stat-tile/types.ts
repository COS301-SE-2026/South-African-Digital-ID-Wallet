import type { LucideIcon } from 'lucide-react-native'

import type { IconTileTone } from '@/components/atoms'

export type StatTileProps = {
  caption?: string
  className?: string
  Icon: LucideIcon
  isPending?: boolean
  label: string
  testID?: string
  tone?: IconTileTone
  value: string
}
