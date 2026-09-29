import type {
  FraudAlertDetailsResponse,
  FraudAlertStatus,
  FraudAlertSummaryResponse,
  SecureAccountAction,
  SecureAccountResponse,
  SecurityActivityResponse,
  SecurityService,
  SecuritySettingsResponse,
} from './types'

export const MOCK_ALERT_ID = '3f2a6c1e-7b4d-4e0a-9c55-2d8e1f0b7a91'

const MOCK_DELAY_MS = 400

const later = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS))

const summary: FraudAlertSummaryResponse = {
  detectedAt: '2026-05-14T14:22:00Z',
  eventType: 'Login',
  id: MOCK_ALERT_ID,
  isImpossibleTravel: true,
  message:
    'We detected a sign-in from London, United Kingdom that is unlikely based on your recent activity in Johannesburg, South Africa.',
  previousLocationLabel: 'Johannesburg, South Africa',
  riskLevel: 'High',
  riskScore: 85,
  status: 'Open',
  suspiciousLocationLabel: 'London, United Kingdom',
  title: 'Possible impossible travel',
}

const details: FraudAlertDetailsResponse = {
  ...summary,
  availableActions: [
    {
      action: 'LogOutOtherDevices',
      description: 'Ends all active sessions except this device.',
      isRecommended: true,
      title: 'Log out of other devices',
    },
    {
      action: 'ResetPassword',
      description: 'Create a new, secure password for your account.',
      isRecommended: false,
      title: 'Reset your password',
    },
    {
      action: 'AddExtraVerification',
      description:
        'Other devices must be verified again and QR codes can only be shared from a trusted device.',
      isRecommended: false,
      title: 'Add extra verification',
    },
  ],
  deviceDescription: 'Chrome on Windows',
  distanceKm: 9065,
  elapsedMinutes: 95,
  impliedSpeedKmh: 5725,
  ipAddress: '185.199.110.23',
  isNewDevice: true,
  isTrustedDevice: false,
  previousLocation: {
    city: 'Johannesburg',
    country: 'South Africa',
    label: 'Johannesburg, South Africa',
    latitude: -26.2041,
    longitude: 28.0473,
    occurredAt: '2026-05-14T12:47:00Z',
  },
  resolutionAction: null,
  resolvedAt: null,
  signals: [],
  suspiciousLocation: {
    city: 'London',
    country: 'United Kingdom',
    label: 'London, United Kingdom',
    latitude: 51.5072,
    longitude: -0.1276,
    occurredAt: '2026-05-14T14:22:00Z',
  },
}

const activity: SecurityActivityResponse[] = [
  {
    deviceDescription: 'Chrome on Windows',
    eventType: 'Login',
    id: 'mock-activity-1',
    isSuspicious: true,
    isTrustedDevice: false,
    locationLabel: 'London, United Kingdom',
    occurredAt: '2026-05-14T14:22:00Z',
    riskLevel: 'High',
    riskScore: 85,
    title: 'Signed in',
  },
  {
    deviceDescription: 'FlashID on Android',
    eventType: 'DeviceVerified',
    id: 'mock-activity-2',
    isSuspicious: false,
    isTrustedDevice: true,
    locationLabel: 'Cape Town, South Africa',
    occurredAt: '2026-05-12T07:14:00Z',
    riskLevel: 'Low',
    riskScore: 5,
    title: 'New device registered',
  },
  {
    deviceDescription: 'FlashID on Android',
    eventType: 'QrGenerated',
    id: 'mock-activity-3',
    isSuspicious: false,
    isTrustedDevice: true,
    locationLabel: 'Pretoria, South Africa',
    occurredAt: '2026-05-10T12:32:00Z',
    riskLevel: 'Low',
    riskScore: 0,
    title: 'QR code generated',
  },
]

const MONITORING =
  "We'll keep monitoring your account for any further suspicious activity."
const MANAGE =
  'You can manage your security settings anytime in the Security section.'

const RESULTS: Record<
  SecureAccountAction,
  Pick<
    SecureAccountResponse,
    'message' | 'nextSteps' | 'requiresPasswordChange'
  >
> = {
  AddExtraVerification: {
    message:
      'Extra verification is now on. Other devices must verify with a one-time code before they can be used again.',
    nextSteps: [
      'Other devices must be verified again with an email code.',
      'QR codes can only be generated from a trusted device.',
      MANAGE,
    ],
    requiresPasswordChange: false,
  },
  LogOutOtherDevices: {
    message:
      "We've logged you out of other devices and kept your account safe.",
    nextSteps: [
      "You'll need to log in again on other devices.",
      MONITORING,
      MANAGE,
    ],
    requiresPasswordChange: false,
  },
  ResetPassword: {
    message:
      "We've logged you out of other devices. Create a new password to finish securing your account.",
    nextSteps: [
      'Create a new, secure password now.',
      "You'll need to log in again on other devices.",
      MONITORING,
    ],
    requiresPasswordChange: true,
  },
}

let alertStatus: FraudAlertStatus = 'Open'

let settings: SecuritySettingsResponse = {
  deviceVerificationEnabled: true,
  enhancedVerificationEnabled: false,
  impossibleTravelDetectionEnabled: true,
  qrGenerationRestricted: true,
  qrRestrictedUntil: null,
  trustedDeviceCount: 2,
}

const getSettings = () =>
  later({ ...settings, qrGenerationRestricted: alertStatus === 'Open' })

const mockSecurityService: SecurityService = {
  dismissAlert: () => {
    alertStatus = 'Dismissed'
    return later<void>(undefined)
  },
  getActivity: () => later(activity),
  getAlert: () =>
    later({
      ...details,
      availableActions: alertStatus === 'Open' ? details.availableActions : [],
      resolvedAt: alertStatus === 'Open' ? null : new Date().toISOString(),
      status: alertStatus,
    }),
  getOverview: () => {
    const isOpen = alertStatus === 'Open'
    return later({
      activeAlertCount: isOpen ? 1 : 0,
      hasActiveAlert: isOpen,
      latestAlert: { ...summary, status: alertStatus },
      qrGenerationRestricted: isOpen,
      qrRestrictedUntil: null,
      recentActivity: activity.slice(0, 3),
    })
  },
  getSettings,
  secureAccount: (alertId, { action }) => {
    alertStatus = 'Secured'
    if (action === 'AddExtraVerification') {
      settings = { ...settings, enhancedVerificationEnabled: true }
    }
    return later({
      action,
      alertId,
      devicesRemoved: 1,
      title: 'Your account is secured',
      ...RESULTS[action],
    })
  },
  updateSettings: ({
    enhancedVerificationEnabled,
    impossibleTravelDetectionEnabled,
  }) => {
    settings = {
      ...settings,
      enhancedVerificationEnabled:
        enhancedVerificationEnabled ?? settings.enhancedVerificationEnabled,
      impossibleTravelDetectionEnabled:
        impossibleTravelDetectionEnabled ??
        settings.impossibleTravelDetectionEnabled,
    }
    return getSettings()
  },
}

export default mockSecurityService
