import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UpdatePasswordCard } from '../update-password-card'

describe('UpdatePasswordCard', () => {
  it('renders the card content', () => {
    render(<UpdatePasswordCard onAction={jest.fn()} />)
    expect(
      screen.getByRole('heading', { name: 'Update Password' })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Keep your account secure with a strong password.')
    ).toBeInTheDocument()
    expect(screen.getByText('Change your password')).toBeInTheDocument()
    expect(screen.getByText('Protect your account')).toBeInTheDocument()
    expect(screen.getByText('Improve security')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Update Password' })
    ).toBeInTheDocument()
  })
  it('calls onAction when clicked', async () => {
    const user = userEvent.setup()
    const onAction = jest.fn()
    render(<UpdatePasswordCard onAction={onAction} />)
    await user.click(
      screen.getByRole('button', { name: 'Update Password' })
    )
    expect(onAction).toHaveBeenCalledTimes(1)
  })
})