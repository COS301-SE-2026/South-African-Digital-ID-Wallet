import type { TextFieldProps } from '@/components/molecules'

export type FormTextFieldProps = Omit<TextFieldProps, 'error' | 'name'> & {
  name: string
}
