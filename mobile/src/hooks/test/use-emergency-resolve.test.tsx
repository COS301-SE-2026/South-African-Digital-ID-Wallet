import { act, renderHook, waitFor } from '@testing-library/react-native'
import * as LocalAuthentication from 'expo-local-authentication'

import { emergencyService } from '@/services/emergency-service'
import { createQueryWrapper } from '@/test/utils/render-with-providers'

import { useEmergencyResolve } from '../use-emergency-resolve'

jest.mock('expo-local-authentication', () => ({
  authenticateAsync: jest.fn(),
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
}))

jest.mock('@/services/emergency-service/emergency-service', () => ({
  __esModule: true,
  default: { resolve: jest.fn() },
}))

const hasHardware = LocalAuthentication.hasHardwareAsync as jest.Mock
const isEnrolled = LocalAuthentication.isEnrolledAsync as jest.Mock
const authenticate = LocalAuthentication.authenticateAsync as jest.Mock
const resolveMock = emergencyService.resolve as jest.Mock

const REQUEST = {
  code: 'https://flashid.co.za/e#1.a.b.c',
  justification: 'Unconscious patient',
  wasOffline: false,
}

const PROFILE = {
  accessedAt: '2026-09-21T10:00:00Z',
  contacts: [],
  identity: {
    dateOfBirth: '1990-01-01',
    names: 'Thandiwe',
    photoUrl: null,
    surname: 'Dlamini',
  },
  medical: [],
  medicalLastUpdatedAt: null,
}

describe('useEmergencyResolve', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    hasHardware.mockResolvedValue(true)
    isEnrolled.mockResolvedValue(true)
    authenticate.mockResolvedValue({ success: true })
  })

  it('Should start with no profile and no error', async () => {
    const { result } = await renderHook(() => useEmergencyResolve(), {
      wrapper: createQueryWrapper(),
    })
    expect(result.current.profile).toBeNull()
    expect(result.current.error).toBeNull()
    expect(result.current.isResolving).toBe(false)
  })

  it('Should resolve the profile once biometrics pass', async () => {
    resolveMock.mockResolvedValue(PROFILE)
    const { result } = await renderHook(() => useEmergencyResolve(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.resolve(REQUEST)
    })

    await waitFor(() => expect(result.current.profile).toEqual(PROFILE))
    expect(resolveMock.mock.calls[0][0]).toEqual(REQUEST)
  })

  it('Should never call the API when biometrics are denied', async () => {
    authenticate.mockResolvedValue({ success: false, error: 'user_cancel' })
    const { result } = await renderHook(() => useEmergencyResolve(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.resolve(REQUEST)
    })

    expect(resolveMock).not.toHaveBeenCalled()
    await waitFor(() =>
      expect(result.current.error).toBe(
        'Identity check failed. The profile was not opened.'
      )
    )
  })

  it('Should never call the API when no biometrics are enrolled', async () => {
    isEnrolled.mockResolvedValue(false)
    const { result } = await renderHook(() => useEmergencyResolve(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.resolve(REQUEST)
    })

    expect(resolveMock).not.toHaveBeenCalled()
    await waitFor(() =>
      expect(result.current.error).toContain('enrolled biometrics')
    )
  })

  it('Should surface a server rejection as a friendly message', async () => {
    resolveMock.mockRejectedValue(new Error('boom'))
    const { result } = await renderHook(() => useEmergencyResolve(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.resolve(REQUEST).catch(() => undefined)
    })

    await waitFor(() =>
      expect(result.current.error).toBe(
        'Something went wrong. Please try again.'
      )
    )
    expect(result.current.profile).toBeNull()
  })

  it('Should clear state on reset', async () => {
    resolveMock.mockResolvedValue(PROFILE)
    const { result } = await renderHook(() => useEmergencyResolve(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      await result.current.resolve(REQUEST)
    })
    await waitFor(() => expect(result.current.profile).toEqual(PROFILE))

    await act(async () => {
      result.current.reset()
    })
    await waitFor(() => expect(result.current.profile).toBeNull())
    expect(result.current.error).toBeNull()
  })
})
