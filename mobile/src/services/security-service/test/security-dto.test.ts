import {
  formatDistance,
  toOpenAlert,
  toSecurityActivityEntries,
} from '../security-dto'
import type {
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

  it('Should return the latest alert while it is open', () => {
    expect(toOpenAlert(overviewWith(ALERT, true))).toBe(ALERT)
  })

  it('Should ignore a latest alert that has been secured', () => {
    const secured = { ...ALERT, status: 'Secured' as const }
    expect(toOpenAlert(overviewWith(secured, false))).toBeNull()
  })
})
