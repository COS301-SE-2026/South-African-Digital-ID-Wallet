import type { LucideIcon } from 'lucide-react-native'
import type { TextInputProps } from 'react-native'

export type BaseTextFieldProps = Omit<TextInputProps, 'secureTextEntry'> & {
  className?: string
  error?: string
  LeftIcon?: LucideIcon
  secure?: boolean
}

export type TextFieldProps = BaseTextFieldProps & {
  name?: string
}
