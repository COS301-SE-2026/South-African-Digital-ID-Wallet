import type { ReactNode } from 'react'

export type WalletScreenProps = {
  action?: ReactNode
  children: ReactNode
  subtitle?: string
  testID?: string
  title: string
}
