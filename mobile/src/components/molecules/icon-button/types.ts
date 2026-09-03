import { LucideIcon } from 'lucide-react-native'

export type IconButtonProps = {
  accessibilityLabel: string
  className?: string
  color?: string
  hasBadge?: boolean
  Icon: LucideIcon
  onPress?: () => void
  size?: number
  testID?: string
}
