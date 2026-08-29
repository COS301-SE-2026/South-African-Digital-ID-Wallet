import type { ChangeEvent } from 'react'

export type SearchBarProps = {
  value?: string
  placeholder?: string
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  className?: string
  disabled?: boolean
}
