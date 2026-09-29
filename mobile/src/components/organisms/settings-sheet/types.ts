import type { ReactNode } from 'react'

export type SettingsSheetProps = {
  children: ReactNode
  footer?: ReactNode
  isVisible: boolean
  onClose: () => void
  subtitle?: string
  testID?: string
  title: string
}
