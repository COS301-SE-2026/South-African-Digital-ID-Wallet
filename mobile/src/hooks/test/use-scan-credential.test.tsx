import { act, renderHook, waitFor } from '@testing-library/react-native'

import { createQueryWrapper } from '@/test/utils/render-with-providers'
import { scanService } from '@/services/scan-service'

import { useScanCredential } from '../use-scan-credential'

jest.mock('@/services/scan-service/scan-service', () => ({
  __esModule: true,
  default: { resolveCredential: jest.fn() },
}))

const resolveMock = scanService.resolveCredential as jest.Mock

const RESULT = {
  credentialType: 'Identity Document',
  disclosedFields: { Gender: 'F' },
}

describe('useScanCredential', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should start with no result', async () => {
    const { result } = await renderHook(() => useScanCredential(), {
      wrapper: createQueryWrapper(),
    })
    expect(result.current.result).toBeNull()
    expect(result.current.isResolving).toBe(false)
  })
  it('Should expose the resolved credential', async () => {
    resolveMock.mockResolvedValue(RESULT)
    const { result } = await renderHook(() => useScanCredential(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      result.current.resolve('tok-1')
    })
    await waitFor(() => expect(result.current.result).toEqual(RESULT))
    expect(resolveMock.mock.calls[0][0]).toBe('tok-1')
  })
  it('Should clear the result on reset', async () => {
    resolveMock.mockResolvedValue(RESULT)
    const { result } = await renderHook(() => useScanCredential(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      result.current.resolve('tok-1')
    })
    await waitFor(() => expect(result.current.result).toEqual(RESULT))
    await act(async () => {
      result.current.reset()
    })
    await waitFor(() => expect(result.current.result).toBeNull())
  })
  it('Should leave the result null when the scan fails', async () => {
    resolveMock.mockRejectedValue(new Error('bad token'))
    const { result } = await renderHook(() => useScanCredential(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      result.current.resolve('tok-1')
    })
    await waitFor(() => expect(result.current.isResolving).toBe(false))
    expect(result.current.result).toBeNull()
  })
})
