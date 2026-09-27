import { act, renderHook } from '@testing-library/react-native'
import { useRouter } from 'expo-router'

import { createQueryWrapper } from '@/test/utils/render-with-providers'
import loginService from '@/services/login-service/login-service'
import { useAuthStore } from '@/stores/auth-store'

import { useSignOut } from '../use-sign-out'

jest.mock('expo-router', () => ({ useRouter: jest.fn() }))
jest.mock('@/services/login-service/login-service', () => ({
  __esModule: true,
  default: { login: jest.fn(), logout: jest.fn(), verifyDevice: jest.fn() },
}))
jest.mock('@/lib/secure-session', () => ({
  clearSession: jest.fn().mockResolvedValue(undefined),
  getBiometricPreference: jest.fn().mockResolvedValue(false),
  getBiometricPrompted: jest.fn().mockResolvedValue(false),
  loadSession: jest.fn().mockResolvedValue(null),
  saveSession: jest.fn().mockResolvedValue(undefined),
  setBiometricPreference: jest.fn().mockResolvedValue(undefined),
  setBiometricPrompted: jest.fn().mockResolvedValue(undefined),
}))
jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
  setAuthToken: jest.fn(),
  setDeviceToken: jest.fn(),
}))

const logoutMock = loginService.logout as jest.Mock
const replace = jest.fn()
const initial = useAuthStore.getState()

describe('useSignOut', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAuthStore.setState(initial, true)
    ;(useRouter as jest.Mock).mockReturnValue({
      replace,
      push: jest.fn(),
      back: jest.fn(),
    })
    logoutMock.mockResolvedValue(undefined)
  })

  it('Should call logout, clear auth and route to login', async () => {
    useAuthStore.getState().signIn({
      expiresAt: '2099-01-01T00:00:00Z',
      names: 'Thabo',
      role: 'citizen',
      surname: 'Mokoena',
      token: 'jwt',
      userId: 'u-1',
    })
    const { result } = await renderHook(() => useSignOut(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await result.current()
    })
    expect(logoutMock).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(replace).toHaveBeenCalledWith('/login')
  })

  it('Should still sign the user out when the logout call fails', async () => {
    logoutMock.mockRejectedValue(new Error('offline'))
    const { result } = await renderHook(() => useSignOut(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await result.current()
    })
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(replace).toHaveBeenCalledWith('/login')
  })
})
