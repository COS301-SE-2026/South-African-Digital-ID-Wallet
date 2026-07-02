import { render, screen } from '@testing-library/react'
import { CredentialsList } from '../credentials-list'

describe('CredentialsList', () => {
  it('renders the default credentials heading', () => {
    render(<CredentialsList />)

    expect(screen.getByText('Your Credentials')).toBeInTheDocument()
  })

  it('renders the default credential items', () => {
    render(<CredentialsList />)

    expect(screen.getByText("Driver's Licence")).toBeInTheDocument()
    expect(screen.getByText('National ID')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'View' })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'Share' })).toHaveLength(2)
  })

  it('renders custom credentials when provided', () => {
    render(
      <CredentialsList
        credentials={[
          {
            id: 'passport',
            title: 'Passport',
            issuer: 'Home Affairs',
            issued: '26 Jul 2016',
          },
        ]}
      />
    )
    expect(screen.getByText('Passport')).toBeInTheDocument()
    expect(screen.queryByText("Driver's Licence")).not.toBeInTheDocument()
  })
})
