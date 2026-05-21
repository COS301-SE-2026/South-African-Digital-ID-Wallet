import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChangePasswordCard } from '../change-password-card'

describe('ChangePasswordCard', () => {
  it('renders the password form', () => {
    render(<ChangePasswordCard />)

    expect(
      screen.getByRole('heading', { name: /change password/i })
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/current password/i)).toBeInTheDocument()
  })

  it('alerts when the passwords do not match', async () => {
    const user = userEvent.setup()
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

    render(<ChangePasswordCard />)

    await user.type(screen.getByPlaceholderText(/new password/i), 'Password1!')
    await user.type(
      screen.getByPlaceholderText(/confirm new password/i),
      'Password2!'
    )
    await user.click(screen.getByRole('button', { name: /update password/i }))

    expect(alertSpy).toHaveBeenCalledWith('New passwords do not match')

    alertSpy.mockRestore()
  })
})
