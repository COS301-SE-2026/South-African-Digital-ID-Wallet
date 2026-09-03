import type { ReactNode } from 'react'

export type DetailScreenProps = {
  action?: ReactNode
  children: ReactNode
  onBack: () => void
  testID?: string
  title: string
}
