import { fireEvent, render, screen } from '@testing-library/react'
import { FraudAlertFlow } from '../fraud-alert-flow'
import type { SecurityAlert } from '../types'

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
describe('FraudAlertFlow', () => {
  it('renders the security alert card', () => {
    render(<FraudAlertFlow alert={alert} />)
    expect(
      screen.getByRole('region', {
        name: /security alert/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/suspicious activity detected/i)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /review security event/i,
      })
    ).toBeInTheDocument()
  })
  it('opens the fraud summary modal', () => {
    render(<FraudAlertFlow alert={alert} />)
    fireEvent.click(
      screen.getByRole('button', {
        name: /review security event/i,
      })
    )
    expect(
      screen.getByRole('heading', {
        name: /suspicious login activity/i,
      })
    ).toBeInTheDocument()
  })
  it('opens the account security guidance layer', () => {
    render(<FraudAlertFlow alert={alert} />)
    fireEvent.click(
      screen.getByRole('button', {
        name: /review security event/i,
      })
    )
    fireEvent.click(
      screen.getByRole('button', {
        name: /how to keep your account secure/i,
      })
    )
    expect(
      screen.getByRole('heading', {
        name: /keep your account secure/i,
      })
    ).toBeInTheDocument()
  })
  it('closes the fraud alert modal', () => {
    render(<FraudAlertFlow alert={alert} />)
    fireEvent.click(
      screen.getByRole('button', {
        name: /review security event/i,
      })
    )
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Close dialog',
      })
    )
    expect(
      screen.queryByRole('heading', {
        name: /suspicious login activity/i,
      })
    ).not.toBeInTheDocument()
  })
  it('renders the correct risk level', () => {
    render(
      <FraudAlertFlow
        alert={{
          ...alert,
          severity: 'medium',
        }}
      />
    )
    expect(screen.getByText('Medium risk')).toBeInTheDocument()
    expect(screen.queryByText('High risk')).not.toBeInTheDocument()
  })
})
