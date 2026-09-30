import { fireEvent, render, screen } from '@testing-library/react'
import { FraudAlertGuidance } from '../fraud-alert-guidance'

describe('FraudAlertGuidance', () => {
  const props = {
    onChangePassword: jest.fn(),
    onReviewActivity: jest.fn(),
    onReviewTrustedDevices: jest.fn(),
    onLogoutOtherDevices: jest.fn().mockResolvedValue(true),
    onDismiss: jest.fn().mockResolvedValue(true),
  }
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('renders the security guidance actions', () => {
    render(<FraudAlertGuidance {...props} />)
    expect(
      screen.getByText(/we detected unusual activity/i)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /change your password/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /review trusted devices/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /check recent activity/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /log out from all other devices/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /dismiss security alert/i,
      })
    ).toBeInTheDocument()
  })
  it('calls the non-password action handlers', () => {
    render(<FraudAlertGuidance {...props} />)
    fireEvent.click(
      screen.getByRole('button', {
        name: /change your password/i,
      })
    )
    fireEvent.click(
      screen.getByRole('button', {
        name: /review trusted devices/i,
      })
    )
    fireEvent.click(
      screen.getByRole('button', {
        name: /check recent activity/i,
      })
    )
    expect(props.onChangePassword).toHaveBeenCalledTimes(1)
    expect(props.onReviewTrustedDevices).toHaveBeenCalledTimes(1)
    expect(props.onReviewActivity).toHaveBeenCalledTimes(1)
  })
  it('submits the logout action with a password', async () => {
    render(<FraudAlertGuidance {...props} />)
    fireEvent.click(
      screen.getByRole('button', {
        name: /log out from all other devices/i,
      })
    )
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'Password123!' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    await screen.findByRole('button', {
      name: /log out from all other devices/i,
    })
    expect(props.onLogoutOtherDevices).toHaveBeenCalledWith('Password123!')
  })
  it('submits the dismiss action with a password', async () => {
    render(<FraudAlertGuidance {...props} />)
    fireEvent.click(
      screen.getByRole('button', {
        name: /dismiss security alert/i,
      })
    )
    fireEvent.change(screen.getByLabelText(/current password/i), {
      target: { value: 'Password123!' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    await screen.findByRole('button', {
      name: /dismiss security alert/i,
    })
    expect(props.onDismiss).toHaveBeenCalledWith('Password123!')
  })
  it('shows an action message when provided', () => {
    render(
      <FraudAlertGuidance
        {...props}
        actionMessage="The security alert has been dismissed."
      />
    )
    expect(
      screen.getByText('The security alert has been dismissed.')
    ).toBeInTheDocument()
  })
})
