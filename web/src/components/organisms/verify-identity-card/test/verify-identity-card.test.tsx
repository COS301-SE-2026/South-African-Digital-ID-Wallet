import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VerifyIdentityCard } from '../verify-identity-card'

describe('VerifyIdentityCard', () => {
  it('renders the heading and description', () => {
    render(
      <VerifyIdentityCard
        saId=""
        pin=""
        onSaIdChange={() => {}}
        onPinChange={() => {}}
        onSubmit={() => {}}
      />
    )

    expect(screen.getByText('Verify your identity')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Enter your South African ID number and the 6-digit activation PIN.'
      )
    ).toBeInTheDocument()
  })

  it('renders the default steps in the progress stepper', () => {
    render(
      <VerifyIdentityCard
        saId=""
        pin=""
        onSaIdChange={() => {}}
        onPinChange={() => {}}
        onSubmit={() => {}}
      />
    )

    expect(screen.getByText('Verify Identity')).toBeInTheDocument()
    expect(screen.getByText('Activate Credentials')).toBeInTheDocument()
    expect(screen.getByText('Complete')).toBeInTheDocument()
  })

  it('renders custom steps when provided', () => {
    render(
      <VerifyIdentityCard
        steps={['Step One', 'Step Two']}
        currentStep={2}
        saId=""
        pin=""
        onSaIdChange={() => {}}
        onPinChange={() => {}}
        onSubmit={() => {}}
      />
    )

    expect(screen.getByText('Step One')).toBeInTheDocument()
    expect(screen.getByText('Step Two')).toBeInTheDocument()
  })

  it('strips non-numeric characters from SA ID input before calling onSaIdChange', () => {
    const onSaIdChange = jest.fn()
    render(
      <VerifyIdentityCard
        saId=""
        pin=""
        onSaIdChange={onSaIdChange}
        onPinChange={() => {}}
        onSubmit={() => {}}
      />
    )

    const saIdInput = screen.getByLabelText('South African ID number')
    fireEvent.change(saIdInput, { target: { value: '9a0b0c1' } })

    expect(onSaIdChange).toHaveBeenCalledWith('9001')
  })

  it('enforces a 13 character max length on the SA ID input', () => {
    render(
      <VerifyIdentityCard
        saId=""
        pin=""
        onSaIdChange={() => {}}
        onPinChange={() => {}}
        onSubmit={() => {}}
      />
    )

    const saIdInput = screen.getByLabelText('South African ID number')
    expect(saIdInput).toHaveAttribute('maxlength', '13')
  })

  it('disables the submit button when saId and pin are incomplete', () => {
    render(
      <VerifyIdentityCard
        saId="900101580"
        pin="123"
        onSaIdChange={() => {}}
        onPinChange={() => {}}
        onSubmit={() => {}}
      />
    )

    expect(
      screen.getByRole('button', { name: /verify & continue/i })
    ).toBeDisabled()
  })

  it('enables the submit button when saId is 13 digits and pin is 6 digits', () => {
    render(
      <VerifyIdentityCard
        saId="9001015800086"
        pin="123456"
        onSaIdChange={() => {}}
        onPinChange={() => {}}
        onSubmit={() => {}}
      />
    )

    expect(
      screen.getByRole('button', { name: /verify & continue/i })
    ).not.toBeDisabled()
  })

  it('calls onSubmit when the form is submitted with valid values', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(
      <VerifyIdentityCard
        saId="9001015800086"
        pin="123456"
        onSaIdChange={() => {}}
        onPinChange={() => {}}
        onSubmit={onSubmit}
      />
    )

    await user.click(screen.getByRole('button', { name: /verify & continue/i }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('shows the submitting state and disables the button while submitting', () => {
    render(
      <VerifyIdentityCard
        saId="9001015800086"
        pin="123456"
        isSubmitting={true}
        onSaIdChange={() => {}}
        onPinChange={() => {}}
        onSubmit={() => {}}
      />
    )

    expect(screen.getByText('Verifying...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /verifying/i })).toBeDisabled()
  })

  it('shows an error message when errorMessage is provided', () => {
    render(
      <VerifyIdentityCard
        saId=""
        pin=""
        errorMessage="Invalid ID or PIN"
        onSaIdChange={() => {}}
        onPinChange={() => {}}
        onSubmit={() => {}}
      />
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid ID or PIN')
  })

  it('does not render an error message when errorMessage is not provided', () => {
    render(
      <VerifyIdentityCard
        saId=""
        pin=""
        onSaIdChange={() => {}}
        onPinChange={() => {}}
        onSubmit={() => {}}
      />
    )

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('does not render the "request new pin" button when onRequestNewPin is not provided', () => {
    render(
      <VerifyIdentityCard
        saId=""
        pin=""
        onSaIdChange={() => {}}
        onPinChange={() => {}}
        onSubmit={() => {}}
      />
    )

    expect(screen.queryByText("Didn't receive a PIN?")).not.toBeInTheDocument()
  })

  it('renders and calls onRequestNewPin when provided and clicked', async () => {
    const user = userEvent.setup()
    const onRequestNewPin = jest.fn()
    render(
      <VerifyIdentityCard
        saId=""
        pin=""
        onSaIdChange={() => {}}
        onPinChange={() => {}}
        onSubmit={() => {}}
        onRequestNewPin={onRequestNewPin}
      />
    )

    const button = screen.getByText("Didn't receive a PIN?")
    await user.click(button)

    expect(onRequestNewPin).toHaveBeenCalledTimes(1)
  })

  it('renders the trust message', () => {
    render(
      <VerifyIdentityCard
        saId=""
        pin=""
        onSaIdChange={() => {}}
        onPinChange={() => {}}
        onSubmit={() => {}}
      />
    )

    expect(
      screen.getByText('Your information is safe with FlashID')
    ).toBeInTheDocument()
  })

  it('prevents default form submission behavior', () => {
    const onSubmit = jest.fn()
    const { container } = render(
      <VerifyIdentityCard
        saId="9001015800086"
        pin="123456"
        onSaIdChange={() => {}}
        onPinChange={() => {}}
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
