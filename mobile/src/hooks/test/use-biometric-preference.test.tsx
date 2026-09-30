import { act, renderHook, waitFor } from '@testing-library/react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import { Alert } from 'react-native'

import { createQueryWrapper } from '@/test/utils/render-with-providers'
import { useAuthStore } from '@/stores/auth-store'

import { useBiometricPreference } from '../use-biometric-preference'

const mockSignOut = jest.fn()

jest.mock('@/hooks/use-sign-out', () => ({ useSignOut: () => mockSignOut }))
jest.mock('expo-local-authentication', () => ({
  getEnrolledLevelAsync: jest.fn(),
  SecurityLevel: { NONE: 0, SECRET: 1, BIOMETRIC_WEAK: 2, BIOMETRIC_STRONG: 3 },
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

const enrolledLevel = LocalAuthentication.getEnrolledLevelAsync as jest.Mock
const initial = useAuthStore.getState()

describe('useBiometricPreference', () => {
  let alertSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    useAuthStore.setState(initial, true)
    enrolledLevel.mockResolvedValue(2)
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {})
  })
  afterEach(() => alertSpy.mockRestore())

  it('Should report support when biometrics are enrolled', async () => {
    const { result } = await renderHook(() => useBiometricPreference(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSupported).toBe(true))
  })
  it('Should report support when only a screen lock is set', async () => {
    enrolledLevel.mockResolvedValue(1)
    const { result } = await renderHook(() => useBiometricPreference(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSupported).toBe(true))
  })
  it('Should report no support without a screen lock', async () => {
    enrolledLevel.mockResolvedValue(0)
    const { result } = await renderHook(() => useBiometricPreference(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSupported).toBe(false))
  })
  it('Should enable the preference without prompting', async () => {
    const { result } = await renderHook(() => useBiometricPreference(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await result.current.toggle(true)
    })
    expect(alertSpy).not.toHaveBeenCalled()
    await waitFor(() =>
      expect(useAuthStore.getState().isBiometricEnabled).toBe(true)
    )
  })
  it('Should warn before turning the preference off', async () => {
    const { result } = await renderHook(() => useBiometricPreference(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await result.current.toggle(false)
    })
    expect(alertSpy).toHaveBeenCalledTimes(1)
    expect(mockSignOut).not.toHaveBeenCalled()
  })
  it('Should keep the preference when the warning is cancelled', async () => {
    await useAuthStore.getState().setBiometricEnabled(true)
    const { result } = await renderHook(() => useBiometricPreference(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await result.current.toggle(false)
    })
    const buttons = alertSpy.mock.calls[0][2] as {
      text: string
      onPress?: () => void
    }[]
    await act(async () => {
      buttons[0].onPress?.()
    })
    expect(useAuthStore.getState().isBiometricEnabled).toBe(true)
    expect(mockSignOut).not.toHaveBeenCalled()
  })
  it('Should disable the preference and sign out when confirmed', async () => {
    await useAuthStore.getState().setBiometricEnabled(true)
    const { result } = await renderHook(() => useBiometricPreference(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      await result.current.toggle(false)
    })
    const buttons = alertSpy.mock.calls[0][2] as {
      text: string
      onPress?: () => void
    }[]
    await act(async () => {
      buttons[1].onPress?.()
    })
    await waitFor(() =>
      expect(useAuthStore.getState().isBiometricEnabled).toBe(false)
    )
    await waitFor(() => expect(mockSignOut).toHaveBeenCalledTimes(1))
  })
})
