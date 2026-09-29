import {
  formatElapsedTime,
  getLocationLabel,
  mapFraudAlertToSecurityAlert,
} from '../mappers'
import type { FraudAlertDetailsResponse } from '../types'

const baseDetails: FraudAlertDetailsResponse = {
  id: 'alert-1',
  title: '',
  message: '',
  riskScore: 20,
  riskLevel: 'Low',
  status: 'Open',
  isImpossibleTravel: false,
  eventType: 'Login',
  detectedAt: '2026-09-29T10:00:00Z',
  previousLocationLabel: null,
  suspiciousLocationLabel: '',
  ipAddress: '',
  deviceDescription: '',
  isNewDevice: true,
  isTrustedDevice: false,
  distanceKm: null,
  elapsedMinutes: 0,
  impliedSpeedKmh: null,
  previousLocation: null,
  suspiciousLocation: {
    city: 'Cape Town',
    country: 'South Africa',
    latitude: null,
    longitude: null,
    label: '',
    occurredAt: '2026-09-29T10:00:00Z',
  },
  signals: [],
  availableActions: [],
  resolvedAt: null,
  resolutionAction: null,
}
describe('fraud alert mappers', () => {
  it('maps Low risk alerts to low severity', () => {
    const result = mapFraudAlertToSecurityAlert(baseDetails)
    expect(result.severity).toBe('low')
    expect(result.title).toBe('Low risk security event')
  })
  it('handles a null previous location', () => {
    const result = mapFraudAlertToSecurityAlert(baseDetails)
    expect(result.previousLogin.location).toBe(
      'No previous location available'
    )
    expect(result.previousLogin.timestamp).toBe('Unavailable')
  })
  it('handles elapsed minutes less than or equal to zero', () => {
    expect(formatElapsedTime(0)).toBe('Unavailable')
    expect(formatElapsedTime(-10)).toBe('Unavailable')
  })
  it('falls back to city and country when the label is empty', () => {
    expect(
      getLocationLabel({
        label: ' ',
        city: 'Cape Town',
        country: 'South Africa',
      })
    ).toBe('Cape Town, South Africa')
  })
  it('uses the unavailable fallback when no location fields exist', () => {
    expect(
      getLocationLabel({
        label: '',
        city: null,
        country: null,
      })
    ).toBe('Location unavailable')
  })
})