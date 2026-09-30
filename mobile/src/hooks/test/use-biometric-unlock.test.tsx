import { act, renderHook } from '@testing-library/react-native'
import * as LocalAuthentication from 'expo-local-authentication'

import { useBiometricUnlock } from '../use-biometric-unlock'

jest.mock('expo-local-authentication', () => ({
  getEnrolledLevelAsync: jest.fn(),
  SecurityLevel: { NONE: 0, SECRET: 1, BIOMETRIC_WEAK: 2, BIOMETRIC_STRONG: 3 },
  authenticateAsync: jest.fn(),
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
}))

const hasHardware = LocalAuthentication.hasHardwareAsync as jest.Mock
const isEnrolled = LocalAuthentication.isEnrolledAsync as jest.Mock
const enrolledLevel = LocalAuthentication.getEnrolledLevelAsync as jest.Mock
const authenticate = LocalAuthentication.authenticateAsync as jest.Mock

describe('useBiometricUnlock', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    hasHardware.mockResolvedValue(true)
    isEnrolled.mockResolvedValue(true)
    enrolledLevel.mockResolvedValue(2)
  })

  it('Should start idle', async () => {
    const { result } = await renderHook(() => useBiometricUnlock())
    expect(result.current.status).toBe('idle')
  })
  it('Should report unavailable when the phone has no screen lock', async () => {
    enrolledLevel.mockResolvedValue(0)
    const { result } = await renderHook(() => useBiometricUnlock())
    let outcome: string | undefined
    await act(async () => {
      outcome = await result.current.unlock('Unlock')
    })
    expect(outcome).toBe('unavailable')
    expect(result.current.status).toBe('unavailable')
    expect(authenticate).not.toHaveBeenCalled()
  })
  it('Should prompt when only a PIN or password is set', async () => {
    enrolledLevel.mockResolvedValue(1)
    authenticate.mockResolvedValue({ success: true })
    const { result } = await renderHook(() => useBiometricUnlock())
    let outcome: string | undefined
    await act(async () => {
      outcome = await result.current.unlock('Unlock')
    })
    expect(outcome).toBe('unlocked')
    expect(authenticate).toHaveBeenCalled()
  })
  it('Should unlock on a successful prompt', async () => {
    authenticate.mockResolvedValue({ success: true })
    const { result } = await renderHook(() => useBiometricUnlock())
    let outcome: string | undefined
    await act(async () => {
      outcome = await result.current.unlock('Unlock FlashID')
    })
    expect(outcome).toBe('unlocked')
    expect(result.current.status).toBe('unlocked')
    expect(authenticate).toHaveBeenCalledWith(
      expect.objectContaining({ promptMessage: 'Unlock FlashID' })
    )
  })
  it('Should deny on a failed prompt', async () => {
    authenticate.mockResolvedValue({ success: false, error: 'user_cancel' })
    const { result } = await renderHook(() => useBiometricUnlock())
    let outcome: string | undefined
    await act(async () => {
      outcome = await result.current.unlock('Unlock')
    })
    expect(outcome).toBe('denied')
    expect(result.current.status).toBe('denied')
  })
  it.each(['not_enrolled', 'not_available', 'no_hardware'])(
    'Should treat the %s error as unavailable',
    async (error) => {
      authenticate.mockResolvedValue({ success: false, error })
      const { result } = await renderHook(() => useBiometricUnlock())
      let outcome: string | undefined
      await act(async () => {
        outcome = await result.current.unlock('Unlock')
      })
      expect(outcome).toBe('unavailable')
    }
  )
  it('Should return to idle on reset', async () => {
    authenticate.mockResolvedValue({ success: true })
    const { result } = await renderHook(() => useBiometricUnlock())
    await act(async () => {
      await result.current.unlock('Unlock')
    })
    await act(async () => {
      result.current.reset()
    })
    expect(result.current.status).toBe('idle')
  })
})
