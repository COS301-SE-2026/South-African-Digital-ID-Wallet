import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSafeReturnTo, LoginForm } from '../login-form'
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
const activationReturnTo =
  '/citizen/verify-identity?token=activation-token&source=email'
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
const setReturnTo = (returnTo: string | null) => {
  const searchParams = new URLSearchParams()
  if (returnTo) searchParams.set('returnTo', returnTo)
  ;(useSearchParams as jest.Mock).mockReturnValue(searchParams)
}
const fill = async () => {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText(/email/i), 'test@test.com')
  await user.type(screen.getByLabelText(/^password:$/i), 'password')
  await user.click(screen.getByRole('button', { name: /login/i }))
  return user
}
describe('LoginForm', () => {
  it('rejects external and protocol-relative return destinations', () => {
    expect(getSafeReturnTo('https://example.com', '/fallback')).toBe(
      '/fallback'
    )
    expect(getSafeReturnTo('//example.com/path', '/fallback')).toBe('/fallback')
  })

  it('preserves query parameters in an internal return destination', () => {
    expect(
      getSafeReturnTo(
        '/citizen/verify-identity?token=abc%2B123&source=email',
        '/fallback'
      )
    ).toBe('/citizen/verify-identity?token=abc%2B123&source=email')
    expect(getSafeReturnTo('/\\example.com/path', '/fallback')).toBe(
      '/fallback'
    )
    expect(getSafeReturnTo('/login', '/fallback')).toBe('/fallback')
    expect(getSafeReturnTo('/citizen/dashboard', '/fallback')).toBe('/fallback')
  })

  it('preserves a safe return destination after successful login', async () => {
    setReturnTo(activationReturnTo)
    ;(loginService.login as jest.Mock).mockResolvedValue({
      role: 'citizen',
      requiresDeviceVerification: false,
      expiresAt: '2026-01-01',
    })
    renderForm()

    await fill()

    expect(push).toHaveBeenCalledWith(activationReturnTo)
  })

  it('keeps the return destination available after login fails', async () => {
    setReturnTo(activationReturnTo)
    ;(loginService.login as jest.Mock)
      .mockRejectedValueOnce(new Error('Invalid credentials'))
      .mockResolvedValueOnce({
        role: 'citizen',
        requiresDeviceVerification: false,
        expiresAt: '2026-01-01',
      })
    renderForm()

    const user = await fill()
    expect(push).not.toHaveBeenCalled()
    expect(screen.getByRole('link', { name: 'Register' })).toHaveAttribute(
      'href',
      `/register?returnTo=${encodeURIComponent(activationReturnTo)}`
    )

    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(push).toHaveBeenCalledWith(activationReturnTo)
  })

  it('carries the return destination through trusted-device verification', async () => {
    setReturnTo(activationReturnTo)
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
    expect(push).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'OTP' }))

    expect(loginService.verifyDevice).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith(activationReturnTo)
    expect(
      jest.mocked(loginService.verifyDevice).mock.invocationCallOrder[0]
    ).toBeLessThan(push.mock.invocationCallOrder[0])
  })

  it('carries the return destination into the registration link', () => {
    setReturnTo(activationReturnTo)
    renderForm()

    expect(screen.getByRole('link', { name: 'Register' })).toHaveAttribute(
      'href',
      `/register?returnTo=${encodeURIComponent(activationReturnTo)}`
    )
  })

  it('handles login error', async () => {
    ;(loginService.login as jest.Mock).mockRejectedValue(new Error())
    renderForm()
    await fill()
  })
  it('handles unverified email', async () => {
    setReturnTo(activationReturnTo)
    ;(loginService.login as jest.Mock).mockRejectedValue({
      response: { data: { code: 'EMAIL_NOT_VERIFIED' } },
      isAxiosError: true,
    })
    renderForm()
    await fill()
    expect(push).toHaveBeenCalledWith(
      `/verify-email?email=${encodeURIComponent('test@test.com')}&returnTo=${encodeURIComponent(activationReturnTo)}`
    )
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
  it('stores the refresh token expiry as the session expiry', async () => {
    ;(loginService.login as jest.Mock).mockResolvedValue({
      role: 'citizen',
      requiresDeviceVerification: false,
      expiresAt: '2026-01-01T00:15:00Z',
      refreshTokenExpiresAt: '2026-01-31T00:00:00Z',
    })
    renderForm()
    await fill()
    expect(window.localStorage.getItem('flashid-session-expires-at')).toBe(
      '2026-01-31T00:00:00Z'
    )
  })
  it('stores the refresh token expiry after device verification', async () => {
    ;(loginService.login as jest.Mock).mockResolvedValue({
      role: 'citizen',
      requiresDeviceVerification: true,
      deviceVerificationId: 'dv-1',
    })
    ;(loginService.verifyDevice as jest.Mock).mockResolvedValue({
      role: 'citizen',
      expiresAt: '2026-01-01T00:15:00Z',
      refreshTokenExpiresAt: '2026-01-31T00:00:00Z',
    })
    renderForm()
    const user = await fill()
    await user.click(screen.getByRole('button', { name: 'OTP' }))
    expect(window.localStorage.getItem('flashid-session-expires-at')).toBe(
      '2026-01-31T00:00:00Z'
    )
  })
})
