import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { LoginForm } from '../login-form'
import loginService from '@/services/login-service/login-service'
import { useUser } from '@/context/user-context'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))
jest.mock('@/context/user-context', () => ({ useUser: jest.fn() }))
jest.mock('@/services/login-service/login-service', () => ({
  __esModule: true,
  default: { login: jest.fn(), verifyDevice: jest.fn() },
}))
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}))
jest.mock('@/components/templates/otp-modal/otp-modal', () => ({
  OtpModal: ({
    open,
    onSuccess,
  }: {
    open: boolean
    onSuccess: (code: string) => void
  }) =>
    open ? <button onClick={() => onSuccess('123456')}>OTP</button> : null,
}))
const push = jest.fn()
const refresh = jest.fn()
const renderForm = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <LoginForm />
    </QueryClientProvider>
  )
beforeEach(() => {
  jest.clearAllMocks()
  ;(useRouter as jest.Mock).mockReturnValue({ push })
  ;(useSearchParams as jest.Mock).mockReturnValue({ get: () => null })
  ;(useUser as jest.Mock).mockReturnValue({ refresh })
})
const fill = async () => {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText(/email/i), 'test@test.com')
  await user.type(screen.getByLabelText(/^password:$/i), 'password')
  await user.click(screen.getByRole('button', { name: /login/i }))
  return user
}
describe('LoginForm', () => {
  it('handles login error', async () => {
    ;(loginService.login as jest.Mock).mockRejectedValue(new Error())
    renderForm()
    await fill()
  })
  it('handles unverified email', async () => {
    ;(loginService.login as jest.Mock).mockRejectedValue({
      response: { data: { code: 'EMAIL_NOT_VERIFIED' } },
      isAxiosError: true,
    })
    renderForm()
    await fill()
    expect(push).toHaveBeenCalled()
  })
  it('handles OTP verification', async () => {
    ;(loginService.login as jest.Mock).mockResolvedValue({
      role: 'citizen',
      requiresDeviceVerification: true,
      deviceVerificationId: 'dv-1',
    })
    ;(loginService.verifyDevice as jest.Mock).mockResolvedValue({
      role: 'citizen',
      expiresAt: '2026-01-01',
    })
    renderForm()
    const user = await fill()
    await user.click(screen.getByRole('button', { name: 'OTP' }))
    expect(loginService.verifyDevice).toHaveBeenCalled()
    expect(refresh).toHaveBeenCalled()
    expect(push).toHaveBeenCalled()
  })
})
