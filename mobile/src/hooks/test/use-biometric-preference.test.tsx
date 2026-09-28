import { act, renderHook, waitFor } from '@testing-library/react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import { Alert } from 'react-native'

import { createQueryWrapper } from '@/test/utils/render-with-providers'
import { useAuthStore } from '@/stores/auth-store'

import { useBiometricPreference } from '../use-biometric-preference'

const mockSignOut = jest.fn()

jest.mock('@/hooks/use-sign-out', () => ({ useSignOut: () => mockSignOut }))
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
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

const hasHardware = LocalAuthentication.hasHardwareAsync as jest.Mock
const isEnrolled = LocalAuthentication.isEnrolledAsync as jest.Mock
const initial = useAuthStore.getState()

describe('useBiometricPreference', () => {
  let alertSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    useAuthStore.setState(initial, true)
    hasHardware.mockResolvedValue(true)
    isEnrolled.mockResolvedValue(true)
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {})
  })
  afterEach(() => alertSpy.mockRestore())

  it('Should report support when hardware is present and enrolled', async () => {
    const { result } = await renderHook(() => useBiometricPreference(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSupported).toBe(true))
  })
  it('Should report no support without hardware', async () => {
    hasHardware.mockResolvedValue(false)
    const { result } = await renderHook(() => useBiometricPreference(), {
      wrapper: createQueryWrapper(),
    })
    await waitFor(() => expect(result.current.isSupported).toBe(false))
  })
  it('Should report no support when nothing is enrolled', async () => {
    isEnrolled.mockResolvedValue(false)
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
