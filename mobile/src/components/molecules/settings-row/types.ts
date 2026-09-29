import type { LucideIcon } from 'lucide-react-native'

export type SettingsRowProps = {
  Icon: LucideIcon
  label: string
  onPress: () => void
  testID?: string
}
