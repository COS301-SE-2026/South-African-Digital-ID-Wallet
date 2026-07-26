import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ManageUserAccount } from '../manage-user-account'
import { ManageUserAccountUser } from '../types'
import {
  DeleteAccountCard,
  SelectiveDisclosureCard,
} from '@/components/molecules'

jest.mock('@/components/organisms/app-sidebar', () => ({
  AppSidebar: () => <div data-testid="app-sidebar" />,
}))

jest.mock('@/components/organisms/app-top-bar', () => ({
  AppTopBar: () => <div data-testid="app-top-bar" />,
}))

jest.mock('@/components/molecules', () => ({
  AccountCard: () => <div data-testid="account-card" />,
  SelectiveDisclosureCard: () => (
    <div data-testod="selective-disclosure-card" />
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

const user: ManageUserAccountUser = {
  name: 'LeBron James',
  initials: 'LJ',
  idLabel: 'ID ending 0123',
}

const defaultProperties = {
  user,
  navSections: [],
  onLogout: jest.fn(),
}

describe('ManageUserAccount', () => {
  it('renders the account management cards', () => {
    render(<ManageUserAccount {...defaultProperties} />)

    expect(screen.getByTestId('account-card')).toBeInTheDocument()
    expect(screen.getByTestId('delete-account-card')).toBeInTheDocument()
  })

  it('opens the change email modal', async () => {
    const user = userEvent.setup()

    render(<ManageUserAccount {...defaultProperties} />)

    await user.click(screen.getByRole('button', { name: /update email/i }))

    expect(screen.getByTestId('update-email-modal')).toBeInTheDocument()
  })

  it('opens the change password modal', async () => {
    const user = userEvent.setup()

    render(<ManageUserAccount {...defaultProperties} />)

    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(screen.getByTestId('update-password-modal')).toBeInTheDocument()
  })
})
