import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ManageUserAccount } from '../manage-user-account'

jest.mock('@/components/molecules', () => ({
  AccountCard: () => <div data-testid="account-card" />,
  ManageUserTrustedDevices: () => (
    <div data-testid="manage-user-trusted-devices" />
  ),
  UpdateEmailCard: ({ onAction }: { onAction: () => void }) => (
    <button onClick={onAction}>Update Email</button>
  ),
  UpdatePasswordCard: ({ onAction }: { onAction: () => void }) => (
    <button onClick={onAction}>Update Password</button>
  ),
  DeleteAccountCard: () => <div data-testid="delete-account-card" />,
  UpdateEmailModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="update-email-modal" /> : null,
  UpdatePasswordModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="update-password-modal" /> : null,
}))

describe('ManageUserAccount', () => {
  it('renders the account management cards', () => {
    render(<ManageUserAccount />)

    expect(screen.getByTestId('account-card')).toBeInTheDocument()
    expect(screen.getByTestId('delete-account-card')).toBeInTheDocument()
  })

  it('opens the change email modal', async () => {
    const user = userEvent.setup()

    render(<ManageUserAccount />)

    await user.click(screen.getByRole('button', { name: /update email/i }))

    expect(screen.getByTestId('update-email-modal')).toBeInTheDocument()
  })

  it('opens the change password modal', async () => {
    const user = userEvent.setup()

    render(<ManageUserAccount />)

    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(screen.getByTestId('update-password-modal')).toBeInTheDocument()
  })
})
