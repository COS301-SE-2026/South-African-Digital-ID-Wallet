import type {
  SecurityAlert,
  SecurityAlertLayer,
} from '@/components/organisms/fraud-alert-flow/types'
export type FraudAlertModalProps = {
  alert: SecurityAlert
  layer: SecurityAlertLayer
  actionMessage?: string
  onClose: () => void
  onOpenGuidance: () => void
  onChangePassword: () => void
  onReviewActivity: () => void
  onReviewTrustedDevices: () => void
  onLogoutOtherDevices: (password: string) => Promise<boolean>
  onDismiss: (password: string) => Promise<boolean>
}
