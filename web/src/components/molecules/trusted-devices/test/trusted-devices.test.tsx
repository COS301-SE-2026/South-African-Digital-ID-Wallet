import { render, screen } from '@testing-library/react'
import { TrustedDevices } from '../trusted-devices'

describe('TrustedDevices', () => {
  it('renders custom devices when provided', () => {
    render(
      <TrustedDevices
        devices={[{ id: 'tablet', name: 'Samsung Tablet', lastSeen: 'Today' }]}
      />
    )
  })
})
