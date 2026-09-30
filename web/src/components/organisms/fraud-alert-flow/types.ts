export type SecurityAlertLayer = 'summary' | 'guidance'
export type SecurityAlert = {
  id: string
  severity: 'high' | 'medium' | 'low'
  title: string
  summary: string
  detailsDescription: string
  newLogin: {
    location: string
    timestamp: string
  }
  previousLogin: {
    location: string
    timestamp: string
  }
  travel: {
    distance: string
    impliedSpeed: string
    timeBetweenLogins: string
  }
  device: {
    name: string
    ipAddress: string
    locationAccuracy: string
  }
}
export type FraudAlertFlowProps = {
  alert: SecurityAlert
  onResolved?: () => void | Promise<void>
}
