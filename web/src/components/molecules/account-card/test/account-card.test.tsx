import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AccountCard } from '../account-card'
import { manageUserAccountService } from '@/services'

jest.mock('@/services/manage-user-account-service', () => ({
  manageUserAccountService: { getMyAccount: jest.fn() },
}))

const account = {
  fullName: 'Unathi Tshakalisa',
  isEnding: '084',
  emailAddress: 'unathi@example.com',
  phoneNumber: '0821234567',
  dateOfBirth: '1998-04-12',
  memberSince: '2026-01-15T00:00:00Z',
  lastLogin: null,
  accountStatus: 'Activated' as const,
}

const renderCard = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <AccountCard />
    </QueryClientProvider>
  )

describe('AccountCard', () => {
  beforeEach(() => {
    ;(manageUserAccountService.getMyAccount as jest.Mock).mockResolvedValue(
      account
    )
  })

  it('Should render the acc details after loading', async () => {
    renderCard()
    expect(await screen.findByText('unathi@example.com')).toBeInTheDocument()
    expect(screen.getByText('Account Status')).toBeInTheDocument()
    expect(screen.getByText('Activated')).toBeInTheDocument()
  })

  it('Should show the failure message when the request fails', async () => {
    ;(manageUserAccountService.getMyAccount as jest.Mock).mockRejectedValue(
      new Error('boom boom boom')
    )
    renderCard()
    expect(
      await screen.findByText(/failed to load account information/i)
    ).toBeInTheDocument()
  })
})
