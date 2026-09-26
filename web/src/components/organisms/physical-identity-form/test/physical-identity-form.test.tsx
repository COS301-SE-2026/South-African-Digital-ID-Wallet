import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PhysicalIdentityForm } from '../physical-identity-form'

const createProps = (overrides = {}) => ({
  saId: '',
  onSaIdChange: jest.fn(),
  onContinue: jest.fn(),
  onBack: jest.fn(),
  ...overrides,
})
describe('PhysicalIdentityForm', () => {
  it('renders the form and validation state', () => {
    render(
      <PhysicalIdentityForm
        {...createProps({
          errorMessage: 'Invalid ID number',
        })}
      />
    )
    expect(screen.getByText('Verify your identity')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Enter your 13-digit ID number')
    ).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid ID number')
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled()
  })
  it('sanitizes the ID number and handles continue and back actions', async () => {
    const user = userEvent.setup()
    const props = createProps({
      saId: '1234567890123',
    })
    render(<PhysicalIdentityForm {...props} />)
    fireEvent.change(
      screen.getByPlaceholderText('Enter your 13-digit ID number'),
      {
        target: {
          value: '123abc4567890123',
        },
      }
    )
    expect(props.onSaIdChange).toHaveBeenCalledWith('1234567890123')
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.click(screen.getByRole('button', { name: 'Back' }))
    expect(props.onContinue).toHaveBeenCalled()
    expect(props.onBack).toHaveBeenCalled()
  })
  it('shows the submitting state and disables actions', () => {
    render(
      <PhysicalIdentityForm
        {...createProps({
          saId: '1234567890123',
          isSubmitting: true,
        })}
      />
    )
    expect(screen.getByRole('button', { name: 'Preparing...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
  })
})
