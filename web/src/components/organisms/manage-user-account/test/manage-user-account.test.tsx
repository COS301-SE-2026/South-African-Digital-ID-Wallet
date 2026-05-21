import { render, screen } from '@testing-library/react'
import { ManageUserAccount } from '../manage-user-account'

jest.mock('@/components/organisms/app-sidebar', () => ({
  AppSidebar: () => <div data-testid="app-sidebar" />,
}))

jest.mock('@/components/organisms/app-top-bar', () => ({
  AppTopBar: () => <div data-testid="app-top-bar" />,
}))

jest.mock('@/components/molecules', () => ({
  AccountCard: () => <div data-testid="account-card" />,
  ActivityOverviewCard: () => <div data-testid="activity-overview-card" />,
  ChangePasswordModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="change-password-modal" /> : null,
  AccountTerminationModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="account-termination-modal" /> : null,
}))

describe('ManageUserAccount', () => {
  it('renders the manage user account actions', () => {
    render(<ManageUserAccount />)

    expect(
      screen.getByRole('button', { name: /change password/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /terminate account/i })
    ).toBeInTheDocument()
  })

  it('opens the change password modal', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()

    render(<ManageUserAccount />)

    await user.click(screen.getByRole('button', { name: /change password/i }))

    expect(screen.getByTestId('change-password-modal')).toBeInTheDocument()
  })

  it('opens the terminate account modal', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()

    render(<ManageUserAccount />)

    await user.click(screen.getByRole('button', { name: /terminate account/i }))

    expect(screen.getByTestId('account-termination-modal')).toBeInTheDocument()
  })
})
