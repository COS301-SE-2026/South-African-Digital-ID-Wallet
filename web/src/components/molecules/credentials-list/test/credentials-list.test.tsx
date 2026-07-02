import { render, screen } from '@testing-library/react'
import { CredentialsList } from '../credentials-list'

describe('CredentialsList', () => {
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
  })
})
