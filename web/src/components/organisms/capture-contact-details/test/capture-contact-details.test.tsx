import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CaptureContactDetails } from '../capture-contact-details'
import { ComponentProps } from 'react'

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn() },
}))
const baseProps = {
  record: { saId: '9001015009087' },
  phone: '',
  setPhone: jest.fn(),
  email: '',
  setEmail: jest.fn(),
  contactDetailsConsent: false,
  setContactConsent: jest.fn(),
  idConsent: true,
  createPendingAccount: jest.fn(),
  accountCreated: false,
  errors: {},
  setErrors: jest.fn(),
  onboardResponse: null,
} as unknown as ComponentProps<typeof CaptureContactDetails>
describe('CaptureContactDetails', () => {
  beforeEach(() => jest.clearAllMocks())
  it('renders and handles input changes', async () => {
    const user = userEvent.setup()
    render(<CaptureContactDetails {...baseProps} />)
    await user.type(screen.getByLabelText(/phone number/i), '0821234567')
    await user.type(screen.getByLabelText(/email address/i), 'test@test.com')
    await user.click(screen.getByRole('checkbox'))
    expect(baseProps.setPhone).toHaveBeenCalled()
    expect(baseProps.setEmail).toHaveBeenCalled()
    expect(baseProps.setContactConsent).toHaveBeenCalled()
  })
  it('shows errors and enables create button', async () => {
    const user = userEvent.setup()
    const props = {
      ...baseProps,
      phone: '0821234567',
      errors: {
        phone: 'Invalid phone',
        email: 'Invalid email',
        contactDetailsConsent: 'Consent required',
      },
      contactDetailsConsent: true,
    }
    render(<CaptureContactDetails {...props} />)
    expect(screen.getByText('Invalid phone')).toBeInTheDocument()
    expect(screen.getByText('Invalid email')).toBeInTheDocument()
    expect(screen.getByText('Consent required')).toBeInTheDocument()
    const button = screen.getByRole('button', {
      name: /create pending flashid account/i,
    })
    expect(button).not.toBeDisabled()
    await user.click(button)
    expect(props.createPendingAccount).toHaveBeenCalled()
  })
  it('shows account details and copies activation PIN', async () => {
    const user = userEvent.setup()
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    render(
      <CaptureContactDetails
        {...baseProps}
        phone="0821234567"
        contactDetailsConsent
        accountCreated
        onboardResponse={{
          citizenId: 'citizen-1',
          saId: '9001015009087',
          status: 'Pending',
          activationPin: '123456',
          activationExpiresAt: '2026-12-31T12:00:00',
        }}
      />
    )
    expect(
      screen.getByText('Citizen onboarded successfully')
    ).toBeInTheDocument()
    expect(screen.getByText('9001015009087')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('123456')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Copy' }))
    expect(writeText).toHaveBeenCalledWith('123456')
  })
})
