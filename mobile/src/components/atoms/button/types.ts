import type { LucideIcon } from 'lucide-react-native'

export type ButtonVariant = 'primary' | 'secondary' | 'text'

export type ButtonProps = {
  className?: string
  disabled?: boolean
  isLoading?: boolean
  label: string
  LeftIcon?: LucideIcon
  onPress: () => void
  testID?: string
  variant?: ButtonVariant
}
