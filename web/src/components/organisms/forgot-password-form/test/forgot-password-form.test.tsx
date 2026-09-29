import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ForgotPasswordForm } from '../forgot-password-form'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

jest.mock('@/services/login-service', () => ({
  loginService: {
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  },
}))

jest.mock('@/lib/exceptionhandler', () => ({
  handleApiError: jest.fn(),
}))

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

import { loginService } from '@/services/login-service'
import { handleApiError } from '@/lib/exceptionhandler'
import toast from 'react-hot-toast'

const EMAIL = 'thabo@flashid.co.za'
const PASSWORD = 'BrandNewPwd456!'

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

async function requestCode(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/email/i), EMAIL)
  await user.click(screen.getByRole('button', { name: /send reset code/i }))
  await screen.findByLabelText(/reset code/i)
}

async function fillReset(
  user: ReturnType<typeof userEvent.setup>,
  code = '123456',
  confirm = PASSWORD
) {
  await user.type(screen.getByLabelText(/reset code/i), code)
  await user.type(screen.getByLabelText(/^new password/i), PASSWORD)
  await user.type(screen.getByLabelText(/confirm new password/i), confirm)
  await user.click(screen.getByRole('button', { name: /update password/i }))
}

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(loginService.forgotPassword as jest.Mock).mockResolvedValue(undefined)
    ;(loginService.resetPassword as jest.Mock).mockResolvedValue(undefined)
  })

  it('starts by asking only for the email', () => {
    render(<ForgotPasswordForm />, { wrapper: createWrapper() })

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/reset code/i)).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /back to login/i })
    ).toHaveAttribute('href', '/login')
  })

  it('sends the code and moves to the reset step', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordForm />, { wrapper: createWrapper() })

    await requestCode(user)

    expect(loginService.forgotPassword).toHaveBeenCalledWith(EMAIL)
    expect(toast.success).toHaveBeenCalled()
    expect(screen.getByLabelText(/email/i)).toBeDisabled()
    expect(screen.getByRole('button', { name: /resend in/i })).toBeDisabled()
  })

  it('resets the password and goes back to login', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordForm />, { wrapper: createWrapper() })

    await requestCode(user)
    await fillReset(user)

    await waitFor(() =>
      expect(loginService.resetPassword).toHaveBeenCalledWith({
        email: EMAIL,
        otp: '123456',
        newPassword: PASSWORD,
        confirmPassword: PASSWORD,
      })
    )
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/login'))
  })

  it('does not call the backend when the passwords differ', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordForm />, { wrapper: createWrapper() })

    await requestCode(user)
    await fillReset(user, '123456', 'SomethingElse1!')

    expect(toast.error).toHaveBeenCalledWith('Passwords do not match.')
    expect(loginService.resetPassword).not.toHaveBeenCalled()
  })

  it('does not call the backend when the code is incomplete', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordForm />, { wrapper: createWrapper() })

    await requestCode(user)
    await fillReset(user, '123')

    expect(toast.error).toHaveBeenCalledWith('Enter the 6-digit code')
    expect(loginService.resetPassword).not.toHaveBeenCalled()
  })

  it('shows the backend error when the reset fails', async () => {
    const error = new Error('The verification code is incorrect')
    ;(loginService.resetPassword as jest.Mock).mockRejectedValue(error)
    const user = userEvent.setup()
    render(<ForgotPasswordForm />, { wrapper: createWrapper() })

    await requestCode(user)
    await fillReset(user)

    await waitFor(() => expect(handleApiError).toHaveBeenCalled())
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('lets the user go back and change the email', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordForm />, { wrapper: createWrapper() })

    await requestCode(user)
    await user.click(
      screen.getByRole('button', { name: /use a different email/i })
    )

    expect(screen.getByLabelText(/email/i)).toBeEnabled()
    expect(screen.queryByLabelText(/reset code/i)).not.toBeInTheDocument()
  })

  it('clears the old code and passwords when the email is changed', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordForm />, { wrapper: createWrapper() })

    await requestCode(user)
    await user.type(screen.getByLabelText(/reset code/i), '123456')
    await user.type(screen.getByLabelText(/^new password/i), PASSWORD)
    await user.type(screen.getByLabelText(/confirm new password/i), PASSWORD)
    await user.click(
      screen.getByRole('button', { name: /use a different email/i })
    )

    expect(screen.getByLabelText(/email/i)).toHaveValue(EMAIL)
    await user.click(screen.getByRole('button', { name: /send reset code/i }))
    await screen.findByLabelText(/reset code/i)

    expect(screen.getByLabelText(/reset code/i)).toHaveValue('')
    expect(screen.getByLabelText(/^new password/i)).toHaveValue('')
    expect(screen.getByLabelText(/confirm new password/i)).toHaveValue('')
  })
})
