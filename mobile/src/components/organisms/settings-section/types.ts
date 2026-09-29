import type { LucideIcon } from 'lucide-react-native'

export type SettingsRowConfig = {
  Icon: LucideIcon
  label: string
  name: string
  onPress: () => void
}

export type SettingsSectionProps = {
  rows: SettingsRowConfig[]
  testID?: string
  title: string
}
