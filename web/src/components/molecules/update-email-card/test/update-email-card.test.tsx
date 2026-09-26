import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UpdateEmailCard } from '../update-email-card'

describe('UpdateEmailCard', () => {
  it('renders the card content', () => {
    render(<UpdateEmailCard onAction={jest.fn()} />)
    expect(
      screen.getByRole('heading', { name: 'Update Email' })
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Change the email address associated with your account.'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('✓ Change your email address')).toBeInTheDocument()
    expect(screen.getByText('✓ Verify your new email')).toBeInTheDocument()
    expect(screen.getByText('✓ Receive notifications')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Update Email' })
    ).toBeInTheDocument()
  })
  it('calls onAction when clicked', async () => {
    const user = userEvent.setup()
    const onAction = jest.fn()
    render(<UpdateEmailCard onAction={onAction} />)
    await user.click(screen.getByRole('button', { name: 'Update Email' }))
    expect(onAction).toHaveBeenCalledTimes(1)
  })
})