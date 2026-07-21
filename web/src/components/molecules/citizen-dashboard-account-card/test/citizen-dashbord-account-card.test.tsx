import { render, screen } from '@testing-library/react'
import { AccountCardCitizenDashboard } from '../citizen-dashboard-account-card'

describe('AccountCardCitizenDashboard', () => {
  const mockUser = {
    userId: '1234567890123',
    names: 'LeBron',
    surname: 'James',
    citizenship: 'South African Citizen',
    memberSince: '12 Feb 2024',
  }

  it('renders the account heading', () => {
    render(<AccountCardCitizenDashboard user={mockUser} />)

    expect(
      screen.getByRole('heading', { name: /your account/i })
    ).toBeInTheDocument()
  })

  it('renders the user information', () => {
    render(<AccountCardCitizenDashboard user={mockUser} />)

    expect(screen.getByText(/lebron james/i)).toBeInTheDocument()

    expect(screen.getByText(/south african citizen/i)).toBeInTheDocument()

    expect(screen.getByText(/id ending ••••123/i)).toBeInTheDocument()
  })

  it('renders guest user information when no user is provided', () => {
    render(<AccountCardCitizenDashboard user={null} />)

    expect(screen.getByText(/guest user/i)).toBeInTheDocument()

    expect(screen.getByText(/south african citizen/i)).toBeInTheDocument()

    expect(screen.getByText(/id ending ••••084/i)).toBeInTheDocument()
  })

  it('renders the manage account link', () => {
    render(<AccountCardCitizenDashboard user={mockUser} />)

    expect(
      screen.getByRole('button', { name: /manage account/i })
    ).toBeInTheDocument()
  })
})
