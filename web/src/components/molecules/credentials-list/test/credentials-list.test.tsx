import { render, screen } from '@testing-library/react'
import { CredentialsList } from '../credentials-list'

describe('CredentialsList', () => {
  it('renders the credential list heading', () => {
    render(<CredentialsList />)

    expect(
      screen.getByRole('heading', { name: /credential list/i })
    ).toBeInTheDocument()
  })

  it('renders all credentials', () => {
    render(<CredentialsList />)

    expect(screen.getByText(/national id card/i)).toBeInTheDocument()

    expect(screen.getByText(/driver's licence/i)).toBeInTheDocument()
  })

  it('renders the credential issuers', () => {
    render(<CredentialsList />)

    expect(screen.getByText(/department of home affairs/i)).toBeInTheDocument()

    expect(screen.getByText(/class b/i)).toBeInTheDocument()
  })

  it('renders a view credential button for each credential', () => {
    render(<CredentialsList />)

    expect(
      screen.getAllByRole('button', { name: /view credential/i })
    ).toHaveLength(2)
  })
})
