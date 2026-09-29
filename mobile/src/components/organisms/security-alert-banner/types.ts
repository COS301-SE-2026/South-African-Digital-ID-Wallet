import type { SecurityBadge } from '@/services/security-service'

export type SecurityAlertBannerTone = 'danger' | 'success'

export type SecurityAlertBannerProps = {
  badge?: SecurityBadge
  footer?: string[]
  message: string
  onPress?: () => void
  testID?: string
  title: string
  tone?: SecurityAlertBannerTone
}
