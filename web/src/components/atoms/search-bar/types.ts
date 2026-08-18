import type { ChangeEvent } from 'react'

export interface SearchBarProps {
  value?: string
  placeholder?: string
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  className?: string
  disabled?: boolean
}
