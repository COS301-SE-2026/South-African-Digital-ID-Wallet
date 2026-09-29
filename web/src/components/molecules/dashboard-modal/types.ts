import type { ReactNode } from 'react'

export type DashboardModalProps = {
  readonly open: boolean
  readonly title: string
  readonly children: ReactNode
  readonly onClose: () => void
  readonly showBottomClose?: boolean
}