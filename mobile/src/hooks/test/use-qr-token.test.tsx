import { act, renderHook, waitFor } from '@testing-library/react-native'

import { createQueryWrapper } from '@/test/utils/render-with-providers'
import { qrService } from '@/services/qr-service'
import { useQrToken } from '../use-qr-token'

jest.mock('@/services/qr-service/qr-service', () => ({
  __esModule: true,
  default: { generate: jest.fn() },
}))

const generateMock = qrService.generate as jest.Mock
const TOKEN = { expiresAt: '2026-01-01T00:01:00Z', token: 'qr-1' }

describe('useQrToken', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should start with no token and not generating', async () => {
    const { result } = await renderHook(() => useQrToken(), {
      wrapper: createQueryWrapper(),
    })
    expect(result.current.token).toBeNull()
    expect(result.current.isGenerating).toBe(false)
  })

  it('Should expose the generated token', async () => {
    generateMock.mockResolvedValue(TOKEN)
    const { result } = await renderHook(() => useQrToken(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      result.current.generate({
        credentialId: 'c-1',
        disclosedFields: ['Photo'],
      })
    })
    await waitFor(() => expect(result.current.token).toEqual(TOKEN))
    expect(generateMock).toHaveBeenCalledWith('c-1', ['Photo'])
  })

  it('Should surface the failure on the error field', async () => {
    generateMock.mockRejectedValue(new Error('boom'))
    const { result } = await renderHook(() => useQrToken(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      result.current.generate({ credentialId: 'c-1', disclosedFields: [] })
    })
    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
    expect(result.current.token).toBeNull()
  })

  it('Should drop the token on reset', async () => {
    generateMock.mockResolvedValue(TOKEN)
    const { result } = await renderHook(() => useQrToken(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      result.current.generate({ credentialId: 'c-1', disclosedFields: [] })
    })
    await waitFor(() => expect(result.current.token).toEqual(TOKEN))
    await act(async () => {
      result.current.reset()
    })
    await waitFor(() => expect(result.current.token).toBeNull())
  })
})
