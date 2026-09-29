import {
  toNoticeDetails,
  toRiskBadge,
  toRouteLabel,
  toTravelPointCaption,
} from '@/services/security-service/security-dto'
import type {
  FraudAlertSummaryResponse,
  SecurityAlertNotice,
  SecurityLocationResponse,
} from '@/services/security-service/types'

const LONDON: SecurityLocationResponse = {
  city: 'London',
  country: 'United Kingdom',
  label: 'London, United Kingdom',
  latitude: 51.5074,
  longitude: -0.1278,
  occurredAt: '2026-05-14T14:22:00Z',
}

const NOTICE: SecurityAlertNotice = {
  alertId: 'alert-1',
  deviceDescription: 'Chrome on Windows',
  location: 'London, United Kingdom',
  message: 'We detected a sign-in from London.',
  occurredAt: '2026-05-14T14:22:00Z',
  qrGenerationRestricted: true,
  qrRestrictedUntil: null,
  riskLevel: 'High',
  riskScore: 90,
  title: 'Possible impossible travel',
}

const ALERT: FraudAlertSummaryResponse = {
  detectedAt: '2026-05-14T14:22:00Z',
  eventType: 'Login',
  id: 'alert-1',
  isImpossibleTravel: true,
  message: 'message',
  previousLocationLabel: 'Johannesburg, South Africa',
  riskLevel: 'High',
  riskScore: 90,
  status: 'Open',
  suspiciousLocationLabel: 'London, United Kingdom',
  title: 'Possible impossible travel',
}

describe('security-dto extras', () => {
  it('Should give each risk level its badge tone', () => {
    expect(toRiskBadge('High')).toEqual({ label: 'High', tone: 'danger' })
    expect(toRiskBadge('Medium')).toEqual({ label: 'Medium', tone: 'warning' })
    expect(toRiskBadge('Low')).toEqual({ label: 'Low', tone: 'success' })
  })

  it('Should put the coordinates above the time in a travel caption', () => {
    const lines = toTravelPointCaption(LONDON).split('\n')
    expect(lines).toHaveLength(2)
    expect(lines[0]).toBe('51.5074, -0.1278')
  })

  it('Should leave the coordinates out when the backend has none', () => {
    const lines = toTravelPointCaption({
      ...LONDON,
      latitude: null,
      longitude: null,
    }).split('\n')
    expect(lines).toHaveLength(1)
    expect(lines[0]).not.toContain('51.5074')
  })

  it('Should list the location, device and risk of a login notice', () => {
    const details = toNoticeDetails(NOTICE)
    expect(details.map((detail) => detail.label)).toEqual([
      'Location',
      'Device',
      'Risk level',
    ])
    expect(details[0].value).toBe('London, United Kingdom')
    expect(details[2].value).toBe('Risk score 90/100')
    expect(details[2].badge).toEqual({ label: 'High', tone: 'danger' })
  })

  it('Should fall back when the notice has no location or device', () => {
    const details = toNoticeDetails({
      ...NOTICE,
      deviceDescription: '',
      location: '',
    })
    expect(details[0].value).toBe('Unknown location')
    expect(details[1].value).toBe('Unknown device')
  })

  it('Should show the route when there is a previous location', () => {
    expect(toRouteLabel(ALERT)).toBe(
      'Johannesburg, South Africa → London, United Kingdom'
    )
  })

  it('Should show only the suspicious location without a previous one', () => {
    expect(toRouteLabel({ ...ALERT, previousLocationLabel: null })).toBe(
      'London, United Kingdom'
    )
  })
})
