import { act, renderHook } from '@testing-library/react-native'
import * as LocalAuthentication from 'expo-local-authentication'

import { useBiometricUnlock } from '../use-biometric-unlock'

jest.mock('expo-local-authentication', () => ({
  authenticateAsync: jest.fn(),
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
}))

const hasHardware = LocalAuthentication.hasHardwareAsync as jest.Mock
const isEnrolled = LocalAuthentication.isEnrolledAsync as jest.Mock
const authenticate = LocalAuthentication.authenticateAsync as jest.Mock

describe('useBiometricUnlock', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    hasHardware.mockResolvedValue(true)
    isEnrolled.mockResolvedValue(true)
  })

  it('Should start idle', async () => {
    const { result } = await renderHook(() => useBiometricUnlock())
    expect(result.current.status).toBe('idle')
  })
  it('Should report unavailable when there is no hardware', async () => {
    hasHardware.mockResolvedValue(false)
    const { result } = await renderHook(() => useBiometricUnlock())
    let outcome: string | undefined
    await act(async () => {
      outcome = await result.current.unlock('Unlock')
    })
    expect(outcome).toBe('unavailable')
    expect(result.current.status).toBe('unavailable')
    expect(authenticate).not.toHaveBeenCalled()
  })
  it('Should report unavailable when nothing is enrolled', async () => {
    isEnrolled.mockResolvedValue(false)
    const { result } = await renderHook(() => useBiometricUnlock())
    let outcome: string | undefined
    await act(async () => {
      outcome = await result.current.unlock('Unlock')
    })
    expect(outcome).toBe('unavailable')
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
