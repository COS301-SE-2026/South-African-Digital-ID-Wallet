import type { FraudAlertStatus } from './types'

const fraudDetectionUrls = {
  overview: (): string => '/api/security/overview',
  activity: (limit = 20): string => `/api/security/activity?limit=${encodeURIComponent(limit)}`,
  alerts: (status?: FraudAlertStatus): string =>
    status
      ? `/api/security/alerts?status=${encodeURIComponent(status)}`
      : '/api/security/alerts',
  alertDetails: (alertId: string): string => `/api/security/alerts/${encodeURIComponent(alertId)}`,

  secureAccount: (alertId: string): string => `/api/security/alerts/${encodeURIComponent(alertId)}/secure`,
  dismissAlert: (alertId: string): string => `/api/security/alerts/${encodeURIComponent(alertId)}/dismiss`,
  settings: (): string => '/api/security/settings',
}
export default fraudDetectionUrls