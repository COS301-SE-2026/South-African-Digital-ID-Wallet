import {
  formatDistance,
  formatElapsed,
  toEventDetails,
  toOpenAlert,
  toSecurityActivityEntries,
  toTravelStats,
} from '../security-dto'
import type {
  FraudAlertDetailsResponse,
  FraudAlertSummaryResponse,
  SecurityActivityResponse,
  SecurityOverviewResponse,
} from '../types'

const ITEM: SecurityActivityResponse = {
  deviceDescription: 'Chrome on Windows',
  eventType: 'Login',
  id: 'event-1',
  isSuspicious: false,
  isTrustedDevice: true,
  locationLabel: 'Pretoria, South Africa',
  occurredAt: '2026-05-10T12:32:00Z',
  riskLevel: 'Low',
  riskScore: 0,
  title: 'Signed in',
}

const ALERT: FraudAlertSummaryResponse = {
  detectedAt: '2026-05-14T14:22:00Z',
  eventType: 'Login',
  id: 'alert-1',
  isImpossibleTravel: true,
  message: 'message',
  previousLocationLabel: 'Johannesburg, South Africa',
  riskLevel: 'High',
  riskScore: 85,
  status: 'Open',
  suspiciousLocationLabel: 'London, United Kingdom',
  title: 'Possible impossible travel',
}

const DETAILS: FraudAlertDetailsResponse = {
  ...ALERT,
  availableActions: [],
  deviceDescription: 'Chrome on Windows',
  distanceKm: 9320,
  elapsedMinutes: 500,
  impliedSpeedKmh: 1118.4,
  ipAddress: '185.199.110.23',
  isNewDevice: true,
  isTrustedDevice: false,
  previousLocation: null,
  resolutionAction: null,
  resolvedAt: null,
  signals: [],
  suspiciousLocation: {
    city: 'London',
    country: 'United Kingdom',
    label: 'London, United Kingdom',
    latitude: 51.5074,
    longitude: -0.1278,
    occurredAt: '2026-05-14T14:22:00Z',
  },
}

const overviewWith = (
  alert: FraudAlertSummaryResponse,
  hasActiveAlert: boolean
): SecurityOverviewResponse => ({
  activeAlertCount: hasActiveAlert ? 1 : 0,
  hasActiveAlert,
  latestAlert: alert,
  qrGenerationRestricted: false,
  qrRestrictedUntil: null,
  recentActivity: [],
})

describe('security-dto', () => {
  it('Should group thousands in the distance hint', () => {
    expect(formatDistance(9064.7)).toBe('± 9,065 km from your last location')
  })

  it('Should omit the distance hint when the backend sends no distance', () => {
    expect(formatDistance(null)).toBeUndefined()
  })

  it('Should colour a safe event green', () => {
    const [entry] = toSecurityActivityEntries([ITEM])
    expect(entry.tone).toBe('soft-green')
  })

  it('Should colour a suspicious high-risk event red', () => {
    const [entry] = toSecurityActivityEntries([
      { ...ITEM, isSuspicious: true, riskLevel: 'High' },
    ])
    expect(entry.tone).toBe('soft-red')
  })

  it('Should colour a suspicious medium-risk event amber', () => {
    const [entry] = toSecurityActivityEntries([
      { ...ITEM, isSuspicious: true, riskLevel: 'Medium' },
    ])
    expect(entry.tone).toBe('soft-amber')
  })

  it('Should leave a zero-risk event without a badge', () => {
    const [entry] = toSecurityActivityEntries([ITEM])
    expect(entry.badge).toBeNull()
  })

  it('Should give a scored event a risk badge', () => {
    const [entry] = toSecurityActivityEntries([
      { ...ITEM, isSuspicious: true, riskLevel: 'High', riskScore: 85 },
    ])
    expect(entry.badge).toEqual({ label: 'High', tone: 'danger' })
  })

  it('Should return the latest alert while it is open', () => {
    expect(toOpenAlert(overviewWith(ALERT, true))).toBe(ALERT)
  })

  it('Should ignore a latest alert that has been secured', () => {
    const secured = { ...ALERT, status: 'Secured' as const }
    expect(toOpenAlert(overviewWith(secured, false))).toBeNull()
  })

  it('Should format elapsed minutes as hours and minutes', () => {
    expect(formatElapsed(500)).toBe('8 h 20 min')
    expect(formatElapsed(45)).toBe('45 min')
    expect(formatElapsed(120)).toBe('2 h')
  })

  it('Should build travel stats only from the figures the backend sends', () => {
    expect(toTravelStats({ ...DETAILS, elapsedMinutes: null })).toEqual([
      { label: 'Distance', value: '9,320 km' },
      { label: 'Implied speed', value: '1,118 km/h' },
    ])
  })

  it('Should mark a new device with a badge', () => {
    const device = toEventDetails(DETAILS).find(
      (detail) => detail.label === 'Device'
    )
    expect(device?.badge).toEqual({ label: 'New device', tone: 'danger' })
  })
})
