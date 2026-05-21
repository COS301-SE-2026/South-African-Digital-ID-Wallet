import { render, screen } from '@testing-library/react'
import { AccountCard } from '../account-card'

describe('AccountCard', () => {
  it('renders the account section title and summary', () => {
    render(<AccountCard />)

    expect(
      screen.getByRole('heading', { name: /your account/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        /view your account information and update your password/i
      )
    ).toBeInTheDocument()
  })

  it('renders the account status', () => {
    render(<AccountCard />)

    expect(screen.getByText('Account Status')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })
})
