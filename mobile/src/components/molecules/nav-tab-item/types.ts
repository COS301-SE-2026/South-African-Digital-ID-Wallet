import type { LucideIcon } from 'lucide-react-native'

export type NavTabVariant = 'default' | 'center'

export type NavTabConfig = {
  Icon: LucideIcon
  label: string
  name: string
  variant?: NavTabVariant
}

export type NavTabItemProps = NavTabConfig & {
  isFocused: boolean
  onPress: () => void
  testID?: string
}
