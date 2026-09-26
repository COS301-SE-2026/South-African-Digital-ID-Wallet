import { act, renderHook, waitFor } from '@testing-library/react-native'

import { openPdf, savePdf } from '@/lib/pdf-file'
import { certifiedCopyService } from '@/services/certified-copy-service'
import { createQueryWrapper } from '@/test/utils/render-with-providers'

import { useCertifiedCopy } from '../use-certified-copy'

jest.mock('@/services/certified-copy-service/certified-copy-service', () => ({
  __esModule: true,
  default: { generate: jest.fn() },
}))
jest.mock('@/lib/pdf-file', () => ({
  openPdf: jest.fn(),
  savePdf: jest.fn(),
}))

const generateMock = certifiedCopyService.generate as jest.Mock
const saveMock = savePdf as jest.Mock
const openMock = openPdf as jest.Mock

const BYTES = new Uint8Array([37, 80, 68, 70])
const FILE = { uri: 'file:///cache/copy.pdf' }

describe('useCertifiedCopy', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    saveMock.mockReturnValue(FILE)
    openMock.mockResolvedValue(undefined)
  })

  it('Should start idle', async () => {
    const { result } = await renderHook(() => useCertifiedCopy(), {
      wrapper: createQueryWrapper(),
    })
    expect(result.current.isGenerating).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('Should download, save and open the certified copy', async () => {
    generateMock.mockResolvedValue({ bytes: BYTES, fileName: 'copy.pdf' })
    const onSuccess = jest.fn()
    const { result } = await renderHook(() => useCertifiedCopy(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      result.current.generate('c-1', { onSuccess })
    })
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(generateMock).toHaveBeenCalledWith('c-1')
    expect(saveMock).toHaveBeenCalledWith(BYTES, 'copy.pdf')
    expect(openMock).toHaveBeenCalledWith(FILE)
    expect(onSuccess.mock.calls[0][0]).toBe(FILE.uri)
  })

  it('Should surface a download failure without saving anything', async () => {
    generateMock.mockRejectedValue(new Error('boom'))
    const { result } = await renderHook(() => useCertifiedCopy(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      result.current.generate('c-1')
    })
    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
    expect(saveMock).not.toHaveBeenCalled()
    expect(openMock).not.toHaveBeenCalled()
  })

  it('Should surface a failure to open the file', async () => {
    generateMock.mockResolvedValue({ bytes: BYTES, fileName: 'copy.pdf' })
    openMock.mockRejectedValue(new Error('no viewer'))
    const { result } = await renderHook(() => useCertifiedCopy(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      result.current.generate('c-1')
    })
    await waitFor(() => expect(result.current.error?.message).toBe('no viewer'))
  })

  it('Should clear the error on reset', async () => {
    generateMock.mockRejectedValue(new Error('boom'))
    const { result } = await renderHook(() => useCertifiedCopy(), {
      wrapper: createQueryWrapper(),
    })
    await act(async () => {
      result.current.generate('c-1')
    })
    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error))
    await act(async () => {
      result.current.reset()
    })
    await waitFor(() => expect(result.current.error).toBeNull())
  })
})
