import { FieldValues, Path } from 'react-hook-form'

export type DropdownOption = {
  label: string
  value: string
}

export type BaseProps = {
  label?: string
  required?: boolean
  placeholder?: string
  options: string[] | DropdownOption[]
  className?: string
  disabled?: boolean
}

export type ControlledProps = BaseProps & {
  useFormContext?: false
  name?: string
  value?: string
  onChange?: (value: string) => void
  hasError?: boolean
}

export type FormProps<T extends FieldValues> = BaseProps & {
  useFormContext: true
  name: Path<T>
  value?: never
  onChange?: never
  hasError?: never
}

export type DropdownProps<T extends FieldValues = FieldValues> =
  | ControlledProps
  | FormProps<T>

export type InnerProps = {
  label?: string
  required?: boolean
  placeholder?: string
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  className?: string
  hasError?: boolean
  errorMessage?: string
  disabled?: boolean
  name?: string
}

export type FormDropdownProps<T extends FieldValues> = FormProps<T> & {
  options: DropdownOption[]
}
