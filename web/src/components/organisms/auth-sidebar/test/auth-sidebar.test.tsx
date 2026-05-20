import { render, screen } from '@testing-library/react'
import { AuthSidebar } from '../auth-sidebar'

describe('AuthSidebar', () => {
  it('renders the Flash ID logo image', () => {
    render(<AuthSidebar />)
    expect(screen.getByAltText('Flash ID')).toBeInTheDocument()
  })

  it('renders the brand name and tagline', () => {
    render(<AuthSidebar />)
    expect(screen.getByText('Flash ID')).toBeInTheDocument()
    expect(
      screen.getByText('Secure Digital Identity Platform')
    ).toBeInTheDocument()
  })

  it('renders the three feature cards', () => {
    render(<AuthSidebar />)
    expect(screen.getByText('Instant Verification')).toBeInTheDocument()
    expect(screen.getByText('Government Verified')).toBeInTheDocument()
    expect(screen.getByText('Secure Credential Sharing')).toBeInTheDocument()
  })

  it('renders the trust statement', () => {
    render(<AuthSidebar />)
    expect(
      screen.getByText('Trusted by citizens. Secured for you.')
    ).toBeInTheDocument()
    expect(screen.getByText('Proudly South African')).toBeInTheDocument()
  })
})
