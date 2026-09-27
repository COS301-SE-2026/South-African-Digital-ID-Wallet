import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UpdatePasswordModal } from '../update-password-modal'
import api from '@/lib/api'

jest.mock('@/lib/api', () => ({
  put: jest.fn().mockResolvedValue({}),
}))
jest.mock('react-hot-toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))
describe('UpdatePasswordModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('submits new password when valid and matching', async () => {
    const user = userEvent.setup()
    const onCloseAction = jest.fn()
    render(<UpdatePasswordModal open onCloseAction={onCloseAction} />)
    await user.type(screen.getByLabelText(/current password/i), 'oldpass123')
    await user.type(screen.getByLabelText(/^new password/i), 'newpass123')
    await user.type(
      screen.getByLabelText(/confirm new password/i),
      'newpass123'
    )
    await user.click(screen.getByRole('button', { name: /update password/i }))
    expect(api.put).toHaveBeenCalledWith('/api/UpdatePassword', {
      currentPassword: 'oldpass123',
      newPassword: 'newpass123',
      confirmPassword: 'newpass123',
    })
  })
  it('shows an error when passwords do not match', async () => {
    const user = userEvent.setup()
    render(<UpdatePasswordModal open onCloseAction={jest.fn()} />)
    await user.type(screen.getByLabelText(/current password/i), 'oldpass123')
    await user.type(screen.getByLabelText(/^new password/i), 'newpass123')
    await user.type(screen.getByLabelText(/confirm new password/i), 'nomatch')
    await user.click(screen.getByRole('button', { name: /update password/i }))
    expect(
      await screen.findByText(/passwords do not match/i)
    ).toBeInTheDocument()
    expect(api.put).not.toHaveBeenCalled()
  })
})
