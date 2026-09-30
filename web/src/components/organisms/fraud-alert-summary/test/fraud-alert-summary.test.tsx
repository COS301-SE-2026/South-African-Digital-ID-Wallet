import { render, screen } from '@testing-library/react'
import { FraudAlertSummary } from '../fraud-alert-summary'
import type { SecurityAlert } from '@/components/organisms/fraud-alert-flow/types'

const alert: SecurityAlert = {
  id: 'alert-1',
  severity: 'high',
  title: 'Suspicious login activity',
  summary: 'A suspicious login was detected on your account.',
  detailsDescription: 'Impossible travel was detected.',
  newLogin: {
    location: 'Cape Town, South Africa',
    timestamp: '29 September 2026 • 10:30',
  },
  previousLogin: {
    location: 'Johannesburg, South Africa',
    timestamp: '29 September 2026 • 08:00',
  },
  travel: {
    distance: '1,400 km',
    impliedSpeed: '560 km/h',
    timeBetweenLogins: '~2 hours 30 minutes',
  },
  device: {
    name: 'Chrome on Windows',
    ipAddress: '192.168.1.10',
    locationAccuracy: 'Approximate location',
  },
}
describe('FraudAlertSummary', () => {
  it('renders the alert title and summary', () => {
    render(<FraudAlertSummary alert={alert} />)
    expect(
      screen.getByText('Suspicious login activity')
    ).toBeInTheDocument()
    expect(
      screen.getByText('A suspicious login was detected on your account.')
    ).toBeInTheDocument()
  })
})