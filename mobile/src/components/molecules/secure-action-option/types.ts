import type { LucideIcon } from 'lucide-react-native'

export type SecureActionOptionProps = {
  description: string
  Icon: LucideIcon
  isRecommended?: boolean
  isSelected: boolean
  onPress: () => void
  testID?: string
  title: string
}
