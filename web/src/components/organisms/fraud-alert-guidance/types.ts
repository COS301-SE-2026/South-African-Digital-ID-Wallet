import type { LucideIcon } from 'lucide-react'
export type FraudAlertGuidanceProps = {
  actionMessage?: string
  onChangePassword: () => void
  onReviewActivity: () => void
  onReviewTrustedDevices: () => void
  onLogoutOtherDevices: (password: string) => Promise<boolean>
  onDismiss: (password: string) => Promise<boolean>
}
export type SecurityActionProps = {
  icon: LucideIcon
  title: string
  description: string
  onClick: () => void
}
