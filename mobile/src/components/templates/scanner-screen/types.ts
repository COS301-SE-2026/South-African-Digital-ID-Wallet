import type { ReactNode } from 'react'

export type ScannerScreenProps = {
  action?: ReactNode
  children: ReactNode
  footer?: ReactNode
  onBack?: () => void
  subtitle?: string
  testID?: string
  title: string
}
