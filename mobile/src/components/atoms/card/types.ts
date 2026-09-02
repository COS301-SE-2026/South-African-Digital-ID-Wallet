import type { ReactNode } from 'react'

export type CardProps = {
  accessibilityLabel?: string
  children: ReactNode
  className?: string
  onPress?: () => void
  testID?: string
}
