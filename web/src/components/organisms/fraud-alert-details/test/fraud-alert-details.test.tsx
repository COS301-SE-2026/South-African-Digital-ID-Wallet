import { fireEvent, render, screen } from '@testing-library/react'
import { FraudAlertDetails } from '../fraud-alert-details'
import type { SecurityAlert } from '@/components/organisms/fraud-alert-flow/types'

const mockAlert: SecurityAlert = {
  id: 'alert-123',
  severity: 'high',
  title: 'Suspicious login activity',
  summary: 'A suspicious login was detected.',
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
describe('FraudAlertDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('renders all fraud alert detail sections', () => {
    render(<FraudAlertDetails alert={mockAlert} onOpenGuidance={jest.fn()} />)
    expect(
      screen.getByRole('heading', { name: /login information/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /travel details/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /device and network/i })
    ).toBeInTheDocument()
  })
  it('renders the login information', () => {
    render(<FraudAlertDetails alert={mockAlert} onOpenGuidance={jest.fn()} />)
    expect(screen.getByText(/Cape Town, South Africa/i)).toBeInTheDocument()
    expect(screen.getByText(/Johannesburg, South Africa/i)).toBeInTheDocument()

    expect(screen.getByText(/29 September 2026 • 10:30/i)).toBeInTheDocument()
    expect(screen.getByText(/29 September 2026 • 08:00/i)).toBeInTheDocument()
  })
  it('renders the travel details', () => {
    render(<FraudAlertDetails alert={mockAlert} onOpenGuidance={jest.fn()} />)
    expect(screen.getByText('1,400 km')).toBeInTheDocument()
    expect(screen.getByText('560 km/h')).toBeInTheDocument()
    expect(screen.getByText('~2 hours 30 minutes')).toBeInTheDocument()
  })
  it('renders the device and network details', () => {
    render(<FraudAlertDetails alert={mockAlert} onOpenGuidance={jest.fn()} />)
    expect(screen.getByText('Chrome on Windows')).toBeInTheDocument()
    expect(screen.getByText('192.168.1.10')).toBeInTheDocument()
    expect(screen.getByText('Approximate location')).toBeInTheDocument()
  })
  it('calls onOpenGuidance when the security button is clicked', () => {
    const onOpenGuidance = jest.fn()
    render(
      <FraudAlertDetails alert={mockAlert} onOpenGuidance={onOpenGuidance} />
    )
    fireEvent.click(
      screen.getByRole('button', {
        name: /how to keep your account secure/i,
      })
    )
    expect(onOpenGuidance).toHaveBeenCalledTimes(1)
  })
})
