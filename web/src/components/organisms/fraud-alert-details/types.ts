import type { LucideIcon } from 'lucide-react'

import type { SecurityAlert } from '@/components/organisms/fraud-alert-flow/types'

export type FraudAlertDetailsProps = {
  alert: SecurityAlert
  onOpenGuidance: () => void
}

export type DetailRowProps = {
  icon: LucideIcon
  label: string
  value: string
}