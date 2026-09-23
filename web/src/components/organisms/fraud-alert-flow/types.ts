export type SecurityAlertLayer = 'summary' | 'details' | 'guidance'

export type SecurityAlert = {
  id: string
  severity: 'high' | 'medium'
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
}

export type FraudAlertModalProps = {
  alert: SecurityAlert
  layer: SecurityAlertLayer
  actionMessage?: string
  onClose: () => void
  onViewDetails: () => void
  onOpenGuidance: () => void
  onChangePassword: () => void
  onReviewActivity: () => void
  onReviewTrustedDevices: () => void
  onUnavailableAction: (message: string) => void
}