import { InputHTMLAttributes } from 'react'

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  helperText?: string
  error?: string
}
