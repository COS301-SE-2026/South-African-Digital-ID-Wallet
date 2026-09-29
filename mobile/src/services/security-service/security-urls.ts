export const SECURITY_ACTIVITY_LIMIT = 20

const alertUrl = (alertId: string): string =>
  `/api/security/alerts/${encodeURIComponent(alertId)}`

const securityUrls = {
  activity: (limit: number = SECURITY_ACTIVITY_LIMIT): string =>
    `/api/security/activity?limit=${limit}`,
  alert: alertUrl,
  dismiss: (alertId: string): string => `${alertUrl(alertId)}/dismiss`,
  overview: (): string => '/api/security/overview',
  secure: (alertId: string): string => `${alertUrl(alertId)}/secure`,
  settings: (): string => '/api/security/settings',
}

export default securityUrls
