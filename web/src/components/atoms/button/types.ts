import { ButtonHTMLAttributes, ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'custom'

export type ButtonPropsType = {
  children?: ReactNode
  variant?: ButtonVariant
  dataCy?: string
  RightIcon?: LucideIcon
  LeftIcon?: LucideIcon
  iconClassName?: string
  isLoading?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>
