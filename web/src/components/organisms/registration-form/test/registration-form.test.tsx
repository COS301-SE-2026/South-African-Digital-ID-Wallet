import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegistrationForm } from '../registration-form'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { registerService } from '@/services/citizen-register-service'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useRouter } from 'next/navigation'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/services/citizen-register-service', () => ({
  registerService: {
    register: jest.fn(),
  },
}))

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

jest.mock('@/lib/api', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}))

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    isAxiosError: jest.fn(),
  },
  isAxiosError: jest.fn(),
}))

const VALID_EMAIL = 'user@gmail.com'
const VALID_PASSWORD = 'Password1!'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  Wrapper.displayName = 'TestWrapper'
  return Wrapper
}

function getEmailInput() {
  return screen.getByLabelText(/email/i)
}

function getPasswordInput() {
  return screen.getByLabelText('Password:')
}

function getConfirmPasswordInput() {
  return screen.getByLabelText(/verify password/i)
}

function getSubmitButton() {
  return screen.getByRole('button', { name: /create account/i })
}

async function fillValidForm(
  user: ReturnType<typeof userEvent.setup>,
  overrides: {
    email?: string
    password?: string
    confirm?: string
  } = {}
) {
  const {
    email = VALID_EMAIL,
    password = VALID_PASSWORD,
    confirm = VALID_PASSWORD,
  } = overrides

  if (email) await user.type(screen.getByLabelText('Email:'), email)
  if (password) await user.type(screen.getByLabelText('Password:'), password)
  if (confirm)
    await user.type(screen.getByLabelText('Verify password:'), confirm)
}

describe('RegistrationForm — unit tests', () => {
  describe('rendering', () => {
    it('renders all required form fields', () => {
      render(<RegistrationForm />, { wrapper: createWrapper() })
      expect(screen.getByLabelText('Email:')).toBeInTheDocument()
      expect(screen.getByLabelText('Password:')).toBeInTheDocument()
      expect(screen.getByLabelText('Verify password:')).toBeInTheDocument()
    })

    it('renders the Create Account submit button', () => {
      render(<RegistrationForm />, { wrapper: createWrapper() })
      expect(getSubmitButton()).toBeInTheDocument()
    })

    it('renders a link to the login page', () => {
      render(<RegistrationForm />, { wrapper: createWrapper() })
      expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument()
    })

    it('renders the input fields with the correct placeholder text', () => {
      render(<RegistrationForm />, { wrapper: createWrapper() })
      expect(
        screen.getByPlaceholderText('Enter your email address')
      ).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText('Enter your password')
      ).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText('Re-enter your password')
      ).toBeInTheDocument()
    })

    it('"Log In" link points to href "/"', () => {
      render(<RegistrationForm />, { wrapper: createWrapper() })
      const loginLink = screen.getByRole('link', { name: /log in/i })
      expect(loginLink).toHaveAttribute('href', '/')
    })
  })

  describe('email input behaviour', () => {
    it('strips spaces so that spaced input is stored without them', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await user.type(getEmailInput(), 'user @gmail. com ')
      expect(getEmailInput()).toHaveValue('user@gmail.com')
    })

    it('pressing the space key does not insert a character', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await user.type(getEmailInput(), ' ')
      expect(getEmailInput()).toHaveValue('')
    })

    it('a valid email address satisfies the email requirement', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await user.click(getSubmitButton())
      expect(
        screen.getByText('Must be a valid email address')
      ).toBeInTheDocument()
      await user.type(getEmailInput(), VALID_EMAIL)
      await user.click(getSubmitButton())
      expect(
        screen.queryByText('Must be a valid email address')
      ).not.toBeInTheDocument()
    })

    it('an empty email does not satisfy the email requirement', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await user.click(getSubmitButton())
      expect(
        screen.getByText('Must be a valid email address')
      ).toBeInTheDocument()
    })
  })

  describe('password input behaviour', () => {
    it('strips spaces so that spaced input is stored without them', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await user.type(getPasswordInput(), 'S3cure Pass !')
      expect(getPasswordInput()).toHaveValue('S3curePass!')
    })

    it('pressing the space key does not insert a character', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await user.type(getPasswordInput(), ' ')
      expect(getPasswordInput()).toHaveValue('')
    })

    it('a valid password requires 10+ characters', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await user.click(getSubmitButton())
      expect(
        screen.getByText('Must be at least 10 characters')
      ).not.toHaveClass('line-through')
      await user.type(getPasswordInput(), 'abcdefghij')
      await user.click(getSubmitButton())
      expect(screen.getByText('Must be at least 10 characters')).toHaveClass(
        'line-through'
      )
    })

    it('a valid password requires an uppercase', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await user.click(getSubmitButton())
      expect(
        screen.getByText('Must contain at least 1 capital letter (A-Z)')
      ).not.toHaveClass('line-through')
      await user.type(getPasswordInput(), 'A')
      await user.click(getSubmitButton())
      expect(
        screen.getByText('Must contain at least 1 capital letter (A-Z)')
      ).toHaveClass('line-through')
    })

    it('a valid password requires a lowercase', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await user.click(getSubmitButton())
      expect(
        screen.getByText('Must contain at least 1 lowercase letter (a-z)')
      ).not.toHaveClass('line-through')
      await user.type(getPasswordInput(), 'b')
      await user.click(getSubmitButton())
      expect(
        screen.getByText('Must contain at least 1 lowercase letter (a-z)')
      ).toHaveClass('line-through')
    })

    it('a valid password requires a digit', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await user.click(getSubmitButton())
      expect(
        screen.getByText('Must contain at least 1 digit (0-9)')
      ).not.toHaveClass('line-through')
      await user.type(getPasswordInput(), '1')
      await user.click(getSubmitButton())
      expect(
        screen.getByText('Must contain at least 1 digit (0-9)')
      ).toHaveClass('line-through')
    })

    it('a valid password requires a special character', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await user.click(getSubmitButton())
      expect(
        screen.getByText(
          'Must conatain at least 1 special character (!@#$%^&*)'
        )
      ).not.toHaveClass('line-through')
      await user.type(getPasswordInput(), '@')
      await user.click(getSubmitButton())
      expect(
        screen.getByText(
          'Must conatain at least 1 special character (!@#$%^&*)'
        )
      ).toHaveClass('line-through')
    })
  })

  describe('confirm password input behaviour', () => {
    it('strips spaces so that spaced input is stored without them', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await user.type(getConfirmPasswordInput(), 'S3cure Pass !')
      expect(getConfirmPasswordInput()).toHaveValue('S3curePass!')
    })

    it('pressing the space key does not insert a character', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await user.type(getConfirmPasswordInput(), ' ')
      expect(getConfirmPasswordInput()).toHaveValue('')
    })

    it('confirm password matching the password satisfies the match requirement', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await user.type(getPasswordInput(), VALID_PASSWORD)
      await user.type(getConfirmPasswordInput(), VALID_PASSWORD)
      await user.click(getSubmitButton())
      expect(
        screen.queryByText('Must match the password above')
      ).not.toBeInTheDocument()
    })

    it('confirm password not matching the password does not satisfy the match requirement', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await user.type(getPasswordInput(), 'notMatching101!')
      await user.type(getConfirmPasswordInput(), 'not_Matching101!')
      await user.click(getSubmitButton())
      expect(
        screen.getByText('Must match the password above')
      ).toBeInTheDocument()
    })

    it('an empty confirm password does not satisfy the match requirement', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await user.click(getSubmitButton())
      expect(
        screen.getByText('Must match the password above')
      ).toBeInTheDocument()
    })
  })

  describe('requirement list visibility', () => {
    it('email requirement list is hidden before the form has been submitted', () => {
      render(<RegistrationForm />, { wrapper: createWrapper() })
      expect(
        screen.queryByText('Must be a valid email address')
      ).not.toBeInTheDocument()
    })

    it('password requirement list is hidden before the form has been submitted', () => {
      render(<RegistrationForm />, { wrapper: createWrapper() })
      expect(
        screen.queryByText('Must be at least 10 characters')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('Must contain at least 1 capital letter (A-Z)')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('Must contain at least 1 digit (0-9)')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('Must contain at least 1 lowercase letter (a-z)')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(
          'Must conatain at least 1 special character (!@#$%^&*)'
        )
      ).not.toBeInTheDocument()
    })

    it('confirm password requirement list is hidden before the form has been submitted', () => {
      render(<RegistrationForm />, { wrapper: createWrapper() })
      expect(
        screen.queryByText('Must match the password above')
      ).not.toBeInTheDocument()
    })

    it('requirement lists become visisble after clikcing submit on an empty form', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await user.click(getSubmitButton())
      expect(
        screen.queryByText('Must be a valid email address')
      ).toBeInTheDocument()
      expect(
        screen.queryByText('Must be at least 10 characters')
      ).toBeInTheDocument()
      expect(
        screen.queryByText('Must contain at least 1 capital letter (A-Z)')
      ).toBeInTheDocument()
      expect(
        screen.queryByText('Must contain at least 1 digit (0-9)')
      ).toBeInTheDocument()
      expect(
        screen.queryByText('Must contain at least 1 lowercase letter (a-z)')
      ).toBeInTheDocument()
      expect(
        screen.queryByText(
          'Must conatain at least 1 special character (!@#$%^&*)'
        )
      ).toBeInTheDocument()
      expect(
        screen.queryByText('Must match the password above')
      ).toBeInTheDocument()
    })

    it('an unmet requirement item renders with the text-destructive class', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await user.click(getSubmitButton())
      expect(screen.getByText('Must be a valid email address')).toHaveClass(
        'text-destructive'
      )
    })

    it('a met requirement item renders with the line-through class', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await user.click(getSubmitButton())
      expect(
        screen.getByText('Must contain at least 1 capital letter (A-Z)')
      ).not.toHaveClass('line-through')
      await user.type(getPasswordInput(), 'A')
      await user.click(getSubmitButton())
      expect(
        screen.getByText('Must contain at least 1 capital letter (A-Z)')
      ).toHaveClass('line-through')
    })

    it('requirement list for a field hides again after that field is edited after clicking submit', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await user.click(getSubmitButton())
      expect(
        screen.getByText('Must contain at least 1 capital letter (A-Z)')
      ).toBeInTheDocument()
      await user.type(getPasswordInput(), 'A')
      expect(
        screen.queryByText('Must contain at least 1 capital letter (A-Z)')
      ).not.toBeInTheDocument()
    })

    it('requirement list is hidden when show is true but all requirements for that field are met', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await user.type(getEmailInput(), VALID_EMAIL)
      await user.click(getSubmitButton())
      expect(
        screen.queryByText('Must be a valid email address')
      ).not.toBeInTheDocument()
      expect(
        screen.getByText('Must contain at least 1 capital letter (A-Z)')
      ).toBeInTheDocument()
    })
  })

  describe('submit button state', () => {
    it('shows "Create account" and is enabled in idle state', () => {
      render(<RegistrationForm />, { wrapper: createWrapper() })
      expect(getSubmitButton()).not.toBeDisabled()
      expect(getSubmitButton()).toHaveTextContent('Create account')
    })

    it('is disabled and shows "Creating account..." while the mutation is pending', async () => {
      ;(registerService.register as jest.Mock).mockReturnValue(
        new Promise(() => {})
      )
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await fillValidForm(user)
      const button = getSubmitButton()
      await user.click(button)
      expect(button).toBeDisabled()
      expect(screen.getByText('Creating account...')).toBeInTheDocument()
    })

    it('shows the spinner icon while the mutation is pending', async () => {
      ;(registerService.register as jest.Mock).mockReturnValue(
        new Promise(() => {})
      )
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await fillValidForm(user)
      await user.click(getSubmitButton())
      expect(document.querySelector('.animate-spin')).toBeInTheDocument()
    })
  })

  describe('form submission - invalid form', () => {
    beforeEach(() => jest.clearAllMocks())

    it('does not call registerService.register when form is invalid', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await user.click(getSubmitButton())
      expect(registerService.register).not.toHaveBeenCalled()
    })

    it('does not call onSubmitAction when form is invalid', async () => {
      const onSubmitAction = jest.fn()
      const user = userEvent.setup()
      render(<RegistrationForm onSubmitAction={onSubmitAction} />, {
        wrapper: createWrapper(),
      })
      await user.click(getSubmitButton())
      expect(onSubmitAction).not.toHaveBeenCalled()
    })

    it('clicking submit with an invalid form reveals the requirements lists', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await user.click(getSubmitButton())
      expect(
        screen.getByText('Must be a valid email address')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Must be a valid email address')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Must be at least 10 characters')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Must contain at least 1 capital letter (A-Z)')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Must contain at least 1 digit (0-9)')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Must contain at least 1 lowercase letter (a-z)')
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Must conatain at least 1 special character (!@#$%^&*)'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText('Must match the password above')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Must match the password above')
      ).toBeInTheDocument()
    })
  })

  describe('form submission - valid form', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      ;(registerService.register as jest.Mock).mockResolvedValue({})
    })

    it('calls registerService.register with { email, password }', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await fillValidForm(user)
      await user.click(getSubmitButton())
      expect(registerService.register).toHaveBeenCalledWith(
        {
          email: VALID_EMAIL,
          password: VALID_PASSWORD,
        },
        expect.any(Object)
      )
    })

    it('calls onSubmitAction with { email, password } when the prop is provided', async () => {
      const onSubmitAction = jest.fn()
      const user = userEvent.setup()
      render(<RegistrationForm onSubmitAction={onSubmitAction} />, {
        wrapper: createWrapper(),
      })
      await fillValidForm(user)
      await user.click(getSubmitButton())
      expect(onSubmitAction).toHaveBeenCalledWith({
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
      })
    })

    it('does not throw when onSubmitAction is not provided', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await fillValidForm(user)
      await expect(user.click(getSubmitButton())).resolves.not.toThrow()
    })
  })

  describe('mutation success', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      ;(registerService.register as jest.Mock).mockResolvedValue({})
    })

    it('calls toast.success with the confirmation message', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await fillValidForm(user)
      await user.click(getSubmitButton())
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Account created successfully. Please check your email to verify your account.'
        )
      })
    })

    it('navigates to /verify-email with the encoded email in the query string', async () => {
      const mockPush = jest.fn()
      jest
        .mocked(useRouter)
        .mockReturnValue({ push: mockPush } as unknown as ReturnType<
          typeof useRouter
        >)
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await fillValidForm(user)
      await user.click(getSubmitButton())
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          `/verify-email?email=${encodeURIComponent(VALID_EMAIL)}`
        )
      })
    })
  })

  describe('mutation error', () => {
    beforeEach(() => jest.clearAllMocks())

    it('shows the API error message from response.data.error when it is Axios error', async () => {
      const axiosError = {
        response: { data: { error: 'Email already in use' } },
      }
      ;(registerService.register as jest.Mock).mockRejectedValue(axiosError)
      ;(axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true)
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await fillValidForm(user)
      await user.click(getSubmitButton())
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Email already in use')
      })
    })

    it('shows the generic fallback message when the error is not an Axios error', async () => {
      ;(registerService.register as jest.Mock).mockRejectedValue(
        'Network error'
      )
      ;(axios.isAxiosError as unknown as jest.Mock).mockReturnValue(false)
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await fillValidForm(user)
      await user.click(getSubmitButton())
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Registration failed. Please try again.'
        )
      })
    })

    it('shows the generic fallback message when Axios error has no response.data.error', async () => {
      const axiosError = { response: { data: {} } }
      ;(registerService.register as jest.Mock).mockRejectedValue(axiosError)
      ;(axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true)
      const user = userEvent.setup()
      render(<RegistrationForm />, { wrapper: createWrapper() })
      await fillValidForm(user)
      await user.click(getSubmitButton())
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Registration failed. Please try again.'
        )
      })
    })
  })
})
