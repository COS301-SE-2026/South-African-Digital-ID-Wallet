import { ReactNode } from 'react'

export interface QuickActionsCardProps {
  icon: ReactNode
  title: string
  description: string
  href: string
  dataCy?: string
}
