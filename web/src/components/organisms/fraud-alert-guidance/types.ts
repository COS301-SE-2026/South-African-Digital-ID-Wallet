import type { LucideIcon } from 'lucide-react'

export type FraudAlertGuidanceProps = {
  actionMessage?: string
  onChangePassword: () => void
  onReviewActivity: () => void
  onReviewTrustedDevices: () => void
  onUnavailableAction: (message: string) => void
}

export type SecurityActionProps = {
  icon: LucideIcon
  title: string
  description: string
  onClick: () => void
}