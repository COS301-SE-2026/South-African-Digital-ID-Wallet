import type { FraudAlertSummaryResponse } from '@/services/security-service'

export type SecurityAlertCardProps = {
  alert: FraudAlertSummaryResponse | null
  onPress: (alertId: string) => void
}
