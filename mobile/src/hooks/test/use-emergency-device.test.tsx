import { act, renderHook, waitFor } from '@testing-library/react-native'

import { emergencyService } from '@/services/emergency-service'
import { createQueryWrapper } from '@/test/utils/render-with-providers'

import { useRegisterEmergencyDevice } from '../use-emergency-device'

import FlashidEmergency from '@/../modules/flashid-emergency'

jest.mock('@/services/emergency-service/emergency-service', () => ({
  __esModule: true,
  default: {
    registerDevice: jest.fn(),
    getOfflineCredential: jest.fn(),
  },
}))

jest.mock('expo-device', () => ({ modelName: 'Pixel 8' }))

jest.mock('@/../modules/flashid-emergency', () => ({
  __esModule: true,
  default: {
    generateEmergencyKey: jest.fn(),
    setEmergencyHandle: jest.fn(),
    setOfflineBundle: jest.fn(),
  },
}))

const generateKey = FlashidEmergency.generateEmergencyKey as jest.Mock
const setHandle = FlashidEmergency.setEmergencyHandle as jest.Mock
const setBundle = FlashidEmergency.setOfflineBundle as jest.Mock
const registerDevice = emergencyService.registerDevice as jest.Mock
const getOffline = emergencyService.getOfflineCredential as jest.Mock

const CREDENTIAL = { expiresAt: '2026-12-01', payload: 'p', signature: 's' }

describe('useRegisterEmergencyDevice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    generateKey.mockResolvedValue({
      isStrongBoxBacked: true,
      publicKeySpki: 'spki',
    })
    registerDevice.mockResolvedValue({ handle: 'handle-1' })
    getOffline.mockResolvedValue(CREDENTIAL)
    setHandle.mockResolvedValue(undefined)
    setBundle.mockResolvedValue(undefined)
  })

  it('Should start idle', async () => {
    const { result } = await renderHook(() => useRegisterEmergencyDevice(), {
      wrapper: createQueryWrapper(),
    })
    expect(result.current.isRegistering).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('Should send the generated key and the device label to the server', async () => {
    const { result } = await renderHook(() => useRegisterEmergencyDevice(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      result.current.register()
    })

    await waitFor(() => expect(registerDevice).toHaveBeenCalled())
    expect(registerDevice.mock.calls[0][0]).toEqual({
      deviceLabel: 'Pixel 8',
      isStrongBoxBacked: true,
      platform: 'android',
      publicKeySpki: 'spki',
    })
  })

  it('Should store the handle and the offline bundle on the device', async () => {
    const { result } = await renderHook(() => useRegisterEmergencyDevice(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      result.current.register()
    })

    await waitFor(() => expect(setBundle).toHaveBeenCalled())
    expect(setHandle).toHaveBeenCalledWith('handle-1')
    expect(setBundle).toHaveBeenCalledWith(JSON.stringify(CREDENTIAL))
  })

  it('Should never store a handle when the server rejects the device', async () => {
    registerDevice.mockRejectedValue(new Error('rejected'))
    const { result } = await renderHook(() => useRegisterEmergencyDevice(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      result.current.register()
    })

    await waitFor(() => expect(result.current.isRegistering).toBe(false))
    expect(setHandle).not.toHaveBeenCalled()
    expect(setBundle).not.toHaveBeenCalled()
  })

  it('Should surface a native keystore failure', async () => {
    generateKey.mockRejectedValue(new Error('StrongBox unavailable'))
    const { result } = await renderHook(() => useRegisterEmergencyDevice(), {
      wrapper: createQueryWrapper(),
    })

    await act(async () => {
      result.current.register()
    })

    await waitFor(() => expect(result.current.error).toBeTruthy())
    expect(registerDevice).not.toHaveBeenCalled()
  })
})
