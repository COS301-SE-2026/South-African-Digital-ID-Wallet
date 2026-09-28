import type { LucideIcon } from 'lucide-react-native'

export type IconTileTone =
  | 'green'
  | 'gold'
  | 'blue'
  | 'red'
  | 'soft-green'
  | 'soft-amber'
  | 'soft-red'
  | 'soft-blue'
  | 'neutral'

export type IconTileShape = 'rounded' | 'circle'

export type IconTileSize = 'sm' | 'md' | 'lg'

export type IconTileProps = {
  className?: string
  Icon: LucideIcon
  shape?: IconTileShape
  size?: IconTileSize
  testID?: string
  tone?: IconTileTone
}
