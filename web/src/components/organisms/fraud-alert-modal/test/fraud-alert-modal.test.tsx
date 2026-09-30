import { render, screen } from '@testing-library/react'
import { FraudAlertModal } from '../fraud-alert-modal'
import type { SecurityAlert } from '@/components/organisms/fraud-alert-flow/types'

const alert: SecurityAlert = {
  id: 'alert-1',
  severity: 'high',
  title: 'Suspicious login activity',
  summary: 'A suspicious login was detected.',
  detailsDescription: 'Impossible travel was detected.',
  newLogin: {
    location: 'Cape Town',
    timestamp: '29 September 2026 • 10:30',
  },
  previousLogin: {
    location: 'Johannesburg',
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
const callbacks = {
  onClose: jest.fn(),
  onOpenGuidance: jest.fn(),
  onChangePassword: jest.fn(),
  onReviewActivity: jest.fn(),
  onReviewTrustedDevices: jest.fn(),
  onLogoutOtherDevices: jest.fn().mockResolvedValue(true),
  onDismiss: jest.fn().mockResolvedValue(true),
}
describe('FraudAlertModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('renders the summary layer', () => {
    render(
      <FraudAlertModal
        alert={alert}
        layer="summary"
        {...callbacks}
      />
    )
    expect(
      screen.getByRole('heading', {
        name: /suspicious login activity/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/a suspicious login was detected/i)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /how to keep your account secure/i,
      })
    ).toBeInTheDocument()
  })
  it('renders the guidance layer', () => {
    render(
      <FraudAlertModal
        alert={alert}
        layer="guidance"
        actionMessage="Review your account."
        {...callbacks}
      />
    )
    expect(
      screen.getByRole('heading', {
        name: /keep your account secure/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Review your account.')
    ).toBeInTheDocument()
  })
})