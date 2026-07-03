import { render, screen } from '@testing-library/react'
import { TrustedDevices } from '../trusted-devices'

describe('TrustedDevices', () => {
  it('renders the heading and default device names', () => {
    render(<TrustedDevices />)

    expect(screen.getByText('Trusted Devices')).toBeInTheDocument()
    expect(screen.getByText('Samsung Galaxy A54')).toBeInTheDocument()
    expect(screen.getByText('iPhone 12')).toBeInTheDocument()
  })

  it('renders a revoke button for each device', () => {
    render(<TrustedDevices />)

    expect(screen.getAllByRole('button', { name: 'Revoke' })).toHaveLength(2)
  })

  it('renders custom devices when provided', () => {
    render(
      <TrustedDevices
        devices={[{ id: 'tablet', name: 'Samsung Tablet', lastSeen: 'Today' }]}
      />
    )

    expect(screen.getByText('Samsung Tablet')).toBeInTheDocument()
    expect(screen.queryByText('iPhone 12')).not.toBeInTheDocument()
  })
})
