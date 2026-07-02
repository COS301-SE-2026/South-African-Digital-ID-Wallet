import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegistrationForm } from '../registration-form'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { VerifyEmailForm } from '../../verify-email-form/verify-email-form'

const mockPush = jest.fn()
const mockGet = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({ get: mockGet }),
}))

jest.mock('@/services/citizen-register-service', () => ({
  registerService: {
    verifyEmail: jest.fn(),
    resendOtp: jest.fn(),
  },
}))

jest.mock('react-hot-toast', () => ({
  registerService: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

import { registerService } from '@/services/citizen-register-service'
import toast from 'react-hot-toast'

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

function getVerifyButton() {
  return screen.getByRole('button', { name: /verify email/i })
}

function getResendButton() {
  return screen.getByRole('button', { name: /resend/i })
}

function getCodeInput() {
  return screen.getByLabelText(/verification code/i)
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

describe('VerifyEmailForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGet.mockReturnValue(VALID_EMAIL)
    ;(registerService.verifyEmail as jest.Mock).mockResolvedValue({
      message: 'Email verified successfully',
    })
    ;(registerService.resendOtp as jest.Mock).mockResolvedValue({
      message: 'Verification code resent',
    })
  })

  describe('rendering', () => {
    it('renders the verification code input', () => {
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      expect(getCodeInput()).toBeInTheDocument()
    })

    it('renders the Verify email submit button', () => {
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      expect(getVerifyButton()).toBeInTheDocument()
    })

    it('renders the Resend code button', () => {
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      expect(getResendButton()).toBeInTheDocument()
    })
  })
})

// describe('RegistrationForm — unit tests', () => {
//   describe('rendering', () => {
//     it('renders all required form fields', () => {
//       render(<RegistrationForm />)
//       expect(screen.getByLabelText('Email:')).toBeInTheDocument()
//       expect(screen.getByLabelText('Password:')).toBeInTheDocument()
//       expect(screen.getByLabelText('Verify password:')).toBeInTheDocument()
//     })

//     it('renders the Create Account submit button', () => {
//       render(<RegistrationForm />)
//       expect(getSubmitButton()).toBeInTheDocument()
//     })

//     it('renders a link to the login page', () => {
//       render(<RegistrationForm />)
//       expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument()
//     })
//   })

//   describe('Email validation', () => {
//     it('strips spaces so that spaced input is stored without them', async () => {
//       const user = userEvent.setup()
//       render(<RegistrationForm />)
//       await user.type(screen.getByLabelText('ID number:'), '123 456 789 0123')
//       expect(screen.getByLabelText('ID number:')).toHaveValue('1234567890123')
//     })

//     it('13 alphabetic characters must NOT satisfy the Exactly 13 digits requirement', async () => {
//       const user = userEvent.setup()
//       render(<RegistrationForm onSubmitAction={jest.fn()} />)
//       await user.type(screen.getByLabelText('Email:'), VALID_EMAIL)
//       await user.type(screen.getByLabelText('Password:'), VALID_PASSWORD)
//       await user.type(screen.getByLabelText('Verify password:'), VALID_PASSWORD)
//       expect(getSubmitButton()).toBeDisabled()
//     })

//     it('13 non-digit characters mixed with dots must NOT satisfy the Exactly 13 digits requirement', async () => {
//       const user = userEvent.setup()
//       render(<RegistrationForm onSubmitAction={jest.fn()} />)
//       await user.type(screen.getByLabelText('Email:'), VALID_EMAIL)
//       await user.type(screen.getByLabelText('Password:'), VALID_PASSWORD)
//       await user.type(screen.getByLabelText('Verify password:'), VALID_PASSWORD)
//       await user.type(screen.getByLabelText('ID number:'), 'AAAAAAAAAAAA.')
//       expect(getSubmitButton()).toBeDisabled()
//     })

//     it('10 digits followed by 3 letters must be treated as invalid', async () => {
//       const user = userEvent.setup()
//       render(<RegistrationForm onSubmitAction={jest.fn()} />)
//       await user.type(screen.getByLabelText('Email:'), VALID_EMAIL)
//       await user.type(screen.getByLabelText('Password:'), VALID_PASSWORD)
//       await user.type(screen.getByLabelText('Verify password:'), VALID_PASSWORD)
//       await user.type(screen.getByLabelText('ID number:'), '1234567890ABC')
//       expect(getSubmitButton()).toBeDisabled()
//     })
//   })

//   describe('Password validation', () => {
//     it('rejects a password shorter than 10 characters', async () => {
//       const user = userEvent.setup()
//       render(<RegistrationForm />)
//       await user.type(screen.getByLabelText('Email:'), VALID_EMAIL)
//       await user.type(screen.getByLabelText('Password:'), 'Short1!')
//       await user.type(screen.getByLabelText('Verify password:'), 'Short1!')
//       expect(getSubmitButton()).toBeDisabled()
//     })

//     it('rejects a password with no uppercase letter', async () => {
//       const user = userEvent.setup()
//       render(<RegistrationForm />)
//       await fillValidForm(user, {
//         password: 'nouppercase1!',
//         confirm: 'nouppercase1!',
//       })
//       expect(getSubmitButton()).toBeDisabled()
//     })

//     it('rejects a password with no lowercase letter', async () => {
//       const user = userEvent.setup()
//       render(<RegistrationForm />)
//       await fillValidForm(user, {
//         password: 'NOLOWERCASE1!',
//         confirm: 'NOLOWERCASE1!',
//       })
//       expect(getSubmitButton()).toBeDisabled()
//     })

//     it('rejects a password that contains no digit', async () => {
//       const user = userEvent.setup()
//       render(<RegistrationForm />)
//       await fillValidForm(user, {
//         password: 'NoDigitPass!',
//         confirm: 'NoDigitPass!',
//       })
//       expect(getSubmitButton()).toBeDisabled()
//     })

//     it('rejects a password that contains no special character', async () => {
//       const user = userEvent.setup()
//       render(<RegistrationForm />)
//       await fillValidForm(user, {
//         password: 'NoSpecial1234',
//         confirm: 'NoSpecial1234',
//       })
//       expect(getSubmitButton()).toBeDisabled()
//     })

//     it('rejects a password whose only special character is a parenthesis', async () => {
//       const user = userEvent.setup()
//       render(<RegistrationForm />)
//       await fillValidForm(user, {
//         password: 'Password1(',
//         confirm: 'Password1(',
//       })
//       expect(getSubmitButton()).toBeDisabled()
//     })

//     it('accepts a password that meets every requirement', async () => {
//       const user = userEvent.setup()
//       render(<RegistrationForm />)
//       await fillValidForm(user)
//       expect(getSubmitButton()).not.toBeDisabled()
//     })

//     it('strips spaces from the password field', async () => {
//       const user = userEvent.setup()
//       render(<RegistrationForm />)
//       await user.type(screen.getByLabelText('Password:'), 'Pass word1!')
//       expect(screen.getByLabelText('Password:')).toHaveValue('Password1!')
//     })
//   })

//   describe('Confirm Password validation', () => {
//     it('rejects when the confirm password field is empty', async () => {
//       const user = userEvent.setup()
//       render(<RegistrationForm />)
//       await user.type(screen.getByLabelText('Email:'), VALID_EMAIL)
//       await user.type(screen.getByLabelText('Password:'), VALID_PASSWORD)
//       expect(getSubmitButton()).toBeDisabled()
//     })

//     it('rejects when confirm password does not match password', async () => {
//       const user = userEvent.setup()
//       render(<RegistrationForm />)
//       await fillValidForm(user, { confirm: 'DifferentPass1!' })
//       expect(getSubmitButton()).toBeDisabled()
//     })

//     it('accepts when confirm password exactly matches password', async () => {
//       const user = userEvent.setup()
//       render(<RegistrationForm />)
//       await fillValidForm(user)
//       expect(getSubmitButton()).not.toBeDisabled()
//     })

//     it('rejects when both password and confirm are empty', () => {
//       render(<RegistrationForm />)
//       expect(getSubmitButton()).toBeDisabled()
//     })
//   })

//   describe('form submission', () => {
//     it('does not call onSubmitAction when the form is invalid and submit is clicked', async () => {
//       const user = userEvent.setup()
//       const onSubmit = jest.fn()
//       render(<RegistrationForm onSubmitAction={onSubmit} />)
//       await user.click(getSubmitButton())
//       expect(onSubmit).not.toHaveBeenCalled()
//     })

//     it('does not call onSubmitAction when Enter is pressed while the form is invalid', async () => {
//       const user = userEvent.setup()
//       const onSubmit = jest.fn()
//       render(<RegistrationForm onSubmitAction={onSubmit} />)
//       await user.type(screen.getByLabelText('ID number:'), '123')
//       await user.keyboard('{Enter}')
//       expect(onSubmit).not.toHaveBeenCalled()
//     })

//     it('calls onSubmitAction once with the correct payload when the form is valid', async () => {
//       const user = userEvent.setup()
//       const onSubmit = jest.fn()
//       render(<RegistrationForm onSubmitAction={onSubmit} />)
//       await fillValidForm(user)
//       await user.click(getSubmitButton())

//       expect(onSubmit).toHaveBeenCalledTimes(1)
//       expect(onSubmit).toHaveBeenCalledWith({
//         email: VALID_EMAIL,
//         password: VALID_PASSWORD,
//       })
//     })

//     it('does not throw when onSubmitAction prop is not provided', async () => {
//       const user = userEvent.setup()
//       render(<RegistrationForm />)
//       await fillValidForm(user)
//       await expect(user.click(getSubmitButton())).resolves.not.toThrow()
//     })

//     it('the submitted payload does not contain a confirmPassword field', async () => {
//       const user = userEvent.setup()
//       const onSubmit = jest.fn()
//       render(<RegistrationForm onSubmitAction={onSubmit} />)
//       await fillValidForm(user)
//       await user.click(getSubmitButton())

//       expect(onSubmit.mock.calls[0][0]).not.toHaveProperty('confirmPassword')
//     })
//   })
// })

// describe('RegistrationForm — integration tests', () => {
//   it('submit button remains disabled until every field satisfies its requirements', async () => {
//     const user = userEvent.setup()
//     render(<RegistrationForm />)

//     expect(getSubmitButton()).toBeDisabled()

//     await user.type(screen.getByLabelText('Email:'), VALID_EMAIL)
//     expect(getSubmitButton()).toBeDisabled()

//     await user.type(screen.getByLabelText('Password:'), VALID_PASSWORD)
//     expect(getSubmitButton()).toBeDisabled()

//     await user.type(screen.getByLabelText('Verify password:'), VALID_PASSWORD)
//     expect(getSubmitButton()).toBeDisabled()
//   })

//   it('changing password after confirm was matched re-invalidates the form', async () => {
//     const user = userEvent.setup()
//     render(<RegistrationForm />)

//     await fillValidForm(user)
//     expect(getSubmitButton()).not.toBeDisabled()

//     const passwordField = screen.getByLabelText('Password:')
//     await user.clear(passwordField)
//     await user.type(passwordField, 'NewPassword1!')

//     expect(getSubmitButton()).toBeDisabled()
//   })

//   it('spaces typed into ID and username are excluded from the submitted payload', async () => {
//     const user = userEvent.setup()
//     const onSubmit = jest.fn()
//     render(<RegistrationForm onSubmitAction={onSubmit} />)

//     await user.type(screen.getByLabelText('ID number:'), '123 456 789 0123')
//     await user.type(screen.getByLabelText('Username:'), 'test user 1')
//     await user.type(screen.getByLabelText('Password:'), VALID_PASSWORD)
//     await user.type(screen.getByLabelText('Verify password:'), VALID_PASSWORD)
//     await user.click(getSubmitButton())

//     expect(onSubmit).toHaveBeenCalledWith(
//       expect.objectContaining({
//         idnumber: '1234567890123',
//         username: 'testuser1',
//       })
//     )
//   })

//   it('verificationMethod in the payload defaults to activation', async () => {
//     const user = userEvent.setup()
//     const onSubmit = jest.fn()
//     render(<RegistrationForm onSubmitAction={onSubmit} />)
//     await fillValidForm(user)
//     await user.click(getSubmitButton())

//     expect(onSubmit).toHaveBeenCalledWith(
//       expect.objectContaining({ verificationMethod: 'activation' })
//     )
//   })

//   it('the payload contains exactly the five expected keys', async () => {
//     const user = userEvent.setup()
//     const onSubmit = jest.fn()
//     render(<RegistrationForm onSubmitAction={onSubmit} />)
//     await fillValidForm(user)
//     await user.click(getSubmitButton())

//     expect(Object.keys(onSubmit.mock.calls[0][0]).sort()).toEqual([
//       'activationCode',
//       'idnumber',
//       'password',
//       'username',
//       'verificationMethod',
//     ])
//   })

//   it('does not submit when only the password field is filled', async () => {
//     const user = userEvent.setup()
//     const onSubmit = jest.fn()
//     render(<RegistrationForm onSubmitAction={onSubmit} />)
//     await user.type(screen.getByLabelText('Password:'), VALID_PASSWORD)
//     await user.click(getSubmitButton())
//     expect(onSubmit).not.toHaveBeenCalled()
//   })

//   it('submitting a second time calls onSubmitAction again', async () => {
//     const user = userEvent.setup()
//     const onSubmit = jest.fn()
//     render(<RegistrationForm onSubmitAction={onSubmit} />)
//     await fillValidForm(user)
//     await user.click(getSubmitButton())
//     await user.click(getSubmitButton())
//     expect(onSubmit).toHaveBeenCalledTimes(2)
//   })
// })
