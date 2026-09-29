import { View } from 'react-native'

import { cn } from '@/lib/utils'
import { colors } from '@/theme/colors'

import type {
  IconTileProps,
  IconTileShape,
  IconTileTone,
  IconTileSize,
} from './types'

const TONE_CONTAINERS: Record<IconTileTone, string> = {
  green: 'bg-primary-green',
  gold: 'bg-accent-gold',
  blue: 'bg-national-blue',
  red: 'bg-national-red',
  'soft-green': 'bg-primary-green/10',
  'soft-amber': 'bg-warning-amber/10',
  'soft-red': 'bg-danger-red/10',
  'soft-blue': 'bg-national-blue/10',
  neutral: 'bg-border-grey',
}

const TONE_ICONS: Record<IconTileTone, string> = {
  green: colors.white,
  gold: colors.white,
  blue: colors.white,
  red: colors.white,
  'soft-green': colors.primaryGreen,
  'soft-amber': colors.warning,
  'soft-red': colors.danger,
  'soft-blue': colors.blue,
  neutral: colors.textMuted,
}

const SIZE_CONTAINERS: Record<IconTileSize, string> = {
  sm: 'h-9 w-9',
  md: 'h-12 w-12',
  lg: 'h-14 w-14',
}

const SIZE_ICONS: Record<IconTileSize, number> = {
  sm: 18,
  md: 22,
  lg: 26,
}

export const IconTile = ({
  className,
  Icon,
  shape = 'rounded',
  size = 'md',
  testID,
  tone = 'green',
}: IconTileProps) => (
  <View
    testID={testID}
    className={cn(
      'items-center justify-center',
      shape === 'circle' ? 'rounded-full' : 'rounded-2xl',
      SIZE_CONTAINERS[size],
      TONE_CONTAINERS[tone],
      className
    )}
  >
    <Icon size={SIZE_ICONS[size]} color={TONE_ICONS[tone]} />
  </View>
)
