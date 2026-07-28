import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { VerifyEmailForm } from '../verify-email-form'
import axios from 'axios'

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
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

import { registerService } from '@/services/citizen-register-service'
import toast from 'react-hot-toast'

const VALID_EMAIL = 'user@gmail.com'
const VALID_CODE = '123456'

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

    it('displays the email address from the URL search params', () => {
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      expect(screen.getByText(new RegExp(VALID_EMAIL))).toBeInTheDocument()
    })

    it('displays "your email" when no email is in the URL', () => {
      mockGet.mockReturnValue(null)
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      expect(screen.getByText(/your email/i)).toBeInTheDocument()
    })

    it('otp input starts empty', () => {
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      expect(getCodeInput()).toHaveValue('')
    })

    it('Resend code button is enabled on initial render', () => {
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      expect(getResendButton()).toBeEnabled()
    })
  })

  describe('otp input behaviour', () => {
    it('strips non-digit characters as you type', async () => {
      const user = userEvent.setup()
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      await user.type(getCodeInput(), '$@!d1234')
      expect(getCodeInput()).toHaveValue('1234')
    })

    it('strips non-digit characters from pasted input', async () => {
      const user = userEvent.setup()
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      await user.type(getCodeInput(), '12-34-56')
      expect(getCodeInput()).toHaveValue('123456')
    })

    it('no more than 6 digits allowed', async () => {
      const user = userEvent.setup()
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      await user.type(getCodeInput(), '1234567890')
      expect(getCodeInput()).toHaveValue('123456')
    })

    it('accepts exactly 6 digits without truncation', async () => {
      const user = userEvent.setup()
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      await user.type(getCodeInput(), VALID_CODE)
      expect(getCodeInput()).toHaveValue(VALID_CODE)
    })
  })

  describe('form submission behaviour', () => {
    it('shows a toast error and does not call the sevice when code is empty', async () => {
      const user = userEvent.setup()
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      await user.click(getVerifyButton())
      expect(toast.error).toHaveBeenCalledWith('Enter the 6-digit code')
      expect(registerService.verifyEmail).not.toHaveBeenCalled()
    })

    it('shows a toast error and does not call the service when code is fewer than 6 digits', async () => {
      const user = userEvent.setup()
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      await user.type(getCodeInput(), '4321')
      await user.click(getVerifyButton())
      expect(toast.error).toHaveBeenCalledWith('Enter the 6-digit code')
      expect(registerService.verifyEmail).not.toHaveBeenCalled()
    })

    it('calls verifyEmail with the correct email and otp on valid submission', async () => {
      const user = userEvent.setup()
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      await user.type(getCodeInput(), VALID_CODE)
      await user.click(getVerifyButton())
      await waitFor(() =>
        expect(registerService.verifyEmail).toHaveBeenCalledWith({
          email: VALID_EMAIL,
          code: VALID_CODE,
        })
      )
    })

    it('shows success toast on successful verification', async () => {
      const user = userEvent.setup()
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      await user.type(getCodeInput(), VALID_CODE)
      await user.click(getVerifyButton())
      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith(
          'Email verified. Please log in.'
        )
      )
    })

    it('redirects to the login page on successful verification', async () => {
      const user = userEvent.setup()
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      await user.type(getCodeInput(), VALID_CODE)
      await user.click(getVerifyButton())
      await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/'))
    })

    it('shows a fallback error toast when verification fails', async () => {
      ;(registerService.verifyEmail as jest.Mock).mockRejectedValue(
        new Error('Network error')
      )
      const user = userEvent.setup()
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      await user.type(getCodeInput(), VALID_CODE)
      await user.click(getVerifyButton())
      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith('Verification failed')
      )
    })

    it('does not redirect when verification fails', async () => {
      ;(registerService.verifyEmail as jest.Mock).mockRejectedValue(
        new Error('Network error')
      )
      const user = userEvent.setup()
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      await user.type(getCodeInput(), VALID_CODE)
      await user.click(getVerifyButton())
      await waitFor(() => expect(toast.error).toHaveBeenCalled())
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('shows the server error message when verification fails with an axios error', async () => {
      jest.spyOn(axios, 'isAxiosError').mockReturnValueOnce(true)
      const fakeError = {
        response: { data: { error: 'Invalid verification code' } },
      }
      ;(registerService.verifyEmail as jest.Mock).mockRejectedValue(fakeError)
      const user = userEvent.setup()
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      await user.type(getCodeInput(), VALID_CODE)
      await user.click(getVerifyButton())
      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith('Invalid verification code')
      )
    })

    it('shows "Verfying..." and disables the button while the mutation is pending', async () => {
      ;(registerService.verifyEmail as jest.Mock).mockImplementation(
        () => new Promise(() => {})
      )
      const user = userEvent.setup()
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      await user.type(getCodeInput(), VALID_CODE)
      await user.click(getVerifyButton())
      await waitFor(() =>
        expect(screen.getByText('Verifying...')).toBeInTheDocument()
      )
      expect(screen.getByRole('button', { name: /verifying/i })).toBeDisabled()
    })
  })

  describe('resend otp behaviour', () => {
    it('call resendOtp with the email from the URL params', async () => {
      const user = userEvent.setup()
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      await user.click(getResendButton())
      await waitFor(() =>
        expect(registerService.resendOtp).toHaveBeenCalledWith(VALID_EMAIL)
      )
    })

    it('shows a success toast after resending otp', async () => {
      const user = userEvent.setup()
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      await user.click(getResendButton())
      await waitFor(() =>
        expect(toast.success).toHaveBeenCalledWith(
          'A new code has been sent to your email.'
        )
      )
    })

    it('shows a countdown on the resend button after resending', async () => {
      const user = userEvent.setup()
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      await user.click(getResendButton())
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /resend in \d+s/i })
        ).toBeInTheDocument()
      )
    })

    it('disables the resend button during the coountdown', async () => {
      const user = userEvent.setup()
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      await user.click(getResendButton())
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /resend in \d+s/i })
        ).toBeDisabled()
      )
    })

    it('shows a fallback error toast when resend fails', async () => {
      ;(registerService.resendOtp as jest.Mock).mockRejectedValue(
        new Error('Network error')
      )
      const user = userEvent.setup()
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      await user.click(getResendButton())
      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith('Could not resend code')
      )
    })

    it('does not start countdown when resend fails', async () => {
      ;(registerService.resendOtp as jest.Mock).mockRejectedValue(
        new Error('Network error')
      )
      const user = userEvent.setup()
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      await user.click(getResendButton())
      await waitFor(() => expect(toast.error).toHaveBeenCalled())
      expect(
        screen.queryByRole('button', { name: /resend in \d+s/i })
      ).not.toBeInTheDocument()
    })

    it('shows the server error message when resend fails with an axios error', async () => {
      jest.spyOn(axios, 'isAxiosError').mockReturnValueOnce(true)
      const fakeError = { response: { data: { error: 'Too many requests' } } }
      ;(registerService.resendOtp as jest.Mock).mockRejectedValue(fakeError)
      const user = userEvent.setup()
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      await user.click(getResendButton())
      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith('Too many requests')
      )
    })

    it('countdown decrements by 1 each second', async () => {
      jest.useFakeTimers()
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      render(<VerifyEmailForm />, { wrapper: createWrapper() })
      await user.click(getResendButton())
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /resend in 60s/i })
        ).toBeInTheDocument()
      )
      act(() => jest.advanceTimersByTime(1000))
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /resend in 59s/i })
        ).toBeInTheDocument()
      )
      act(() => jest.advanceTimersByTime(1000))
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /resend in 58s/i })
        ).toBeInTheDocument()
      )
      jest.useRealTimers()
    })
  })
})
