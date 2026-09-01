import type { LucideIcon } from 'lucide-react-native'

export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'danger'

export type BaseButtonProps = {
  className?: string
  disabled?: boolean
  isLoading?: boolean
  label: string
  LeftIcon?: LucideIcon
  onPress?: () => void
  testID?: string
  variant?: ButtonVariant
}

export type ButtonProps = BaseButtonProps & {
  type?: 'button' | 'submit'
}
