import type { SecurityAlert } from '@/components/organisms/fraud-alert-flow/types'

export type FraudAlertSummaryProps = {
  alert: SecurityAlert
  onViewDetails: () => void
}