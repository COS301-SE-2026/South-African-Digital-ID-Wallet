import { fireEvent, render, screen } from '@testing-library/react'
import { FraudAlertGuidance } from '../fraud-alert-guidance'

describe('FraudAlertGuidance', () => {
  const props = {
    onChangePassword: jest.fn(),
    onReviewActivity: jest.fn(),
    onReviewTrustedDevices: jest.fn(),
    onUnavailableAction: jest.fn(),
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
  })
  it('calls the correct action handlers', () => {
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
  it('shows an action message when provided', () => {
    render(
      <FraudAlertGuidance
        {...props}
        actionMessage="This action is not available yet."
      />
    )
    expect(
      screen.getByText('This action is not available yet.')
    ).toBeInTheDocument()
  })
  it('reports unavailable actions', () => {
    render(<FraudAlertGuidance {...props} />)
    fireEvent.click(
      screen.getByRole('button', {
        name: /log out from all other devices/i,
      })
    )
    expect(props.onUnavailableAction).toHaveBeenCalledWith(
      'Logging out from all other devices is not available in this frontend demo yet.'
    )
  })
})