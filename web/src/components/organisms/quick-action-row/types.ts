import { ReactNode } from 'react'

export interface QuickAction {
  key: string
  icon: ReactNode
  title: string
  description: string
  href: string
}

export interface QuickActionsRowProps {
  actions: QuickAction[]
}
