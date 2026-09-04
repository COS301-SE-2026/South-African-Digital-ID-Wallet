import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VerifyIdentityCard } from '../verify-identity-card'

describe('VerifyIdentityCard', () => {
  const defaultProps = {
    saId: '',
    pin: '',
    activationCode: '',
    onSaIdChange: jest.fn(),
    onPinChange: jest.fn(),
    onActivationCodeChange: jest.fn(),
    onSubmit: jest.fn(),
  }
  it('renders the heading and description', () => {
    render(<VerifyIdentityCard {...defaultProps} />)

    expect(screen.getByText('Verify your identity')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Enter your South African ID number and the 6-digit activation PIN.'
      )
    ).toBeInTheDocument()
  })

  it('renders custom steps when provided', () => {
    render(
      <VerifyIdentityCard
        {...defaultProps}
        steps={['Step One', 'Step Two']}
        currentStep={1}
      />
    )

    expect(screen.getByText('Step One')).toBeInTheDocument()
    expect(screen.getByText('Step Two')).toBeInTheDocument()
  })

  it('enforces a 13 character max length on the SA ID input', () => {
    render(<VerifyIdentityCard {...defaultProps} />)

    const saIdInput = screen.getByLabelText('South African ID number')
    expect(saIdInput).toHaveAttribute('maxlength', '13')
  })

  it('disables the submit button when saId and pin are incomplete', () => {
    render(<VerifyIdentityCard {...defaultProps} />)

    expect(
      screen.getByRole('button', { name: /verify identity/i })
    ).toBeDisabled()
  })

  it('shows an error message when errorMessage is provided', () => {
    render(
      <VerifyIdentityCard {...defaultProps} errorMessage="Invalid ID or PIN" />
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid ID or PIN')
  })

  it('does not render an error message when errorMessage is not provided', () => {
    render(<VerifyIdentityCard {...defaultProps} />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('does not render the "request new pin" button when onRequestNewPin is not provided', () => {
    render(<VerifyIdentityCard {...defaultProps} />)

    expect(screen.queryByText('Resend OTP')).not.toBeInTheDocument()
  })

  it('renders and calls onRequestNewPin when provided and clicked', async () => {
    const user = userEvent.setup()
    const onRequestNewPin = jest.fn()
    render(
      <VerifyIdentityCard {...defaultProps} onRequestNewPin={onRequestNewPin} />
    )

    const button = screen.getByText('Resend OTP')
    await user.click(button)

    expect(onRequestNewPin).toHaveBeenCalledTimes(1)
  })

  it('renders the trust message', () => {
    render(<VerifyIdentityCard {...defaultProps} />)

    expect(
      screen.getByText('Your information is safe with FlashID')
    ).toBeInTheDocument()
  })

  it('prevents default form submission behavior', () => {
    const onSubmit = jest.fn()
    const { container } = render(
      <VerifyIdentityCard
        {...defaultProps}
        saId="9001015800086"
        pin="123456"
        onSubmit={onSubmit}
      />
    )

    const form = container.querySelector('form')
    expect(form).not.toBeNull()

    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true,
    })
    form!.dispatchEvent(submitEvent)

    expect(submitEvent.defaultPrevented).toBe(true)
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
