import { AxiosError, type AxiosResponse } from 'axios'

import api from '@/lib/api'
import certifiedCopyService from '../certified-copy-service'
import { resolveCertifiedCopyError } from '../certified-copy-errors'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
  setAuthToken: jest.fn(),
  setDeviceToken: jest.fn(),
}))

const postMock = api.post as jest.Mock

const axiosErrorWith = (status: number | undefined, data: unknown = {}) =>
  new AxiosError(
    'failed',
    'ERR_BAD_REQUEST',
    undefined,
    undefined,
    status === undefined ? undefined : ({ status, data } as AxiosResponse)
  )

describe('certifiedCopyService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should request the pdf as binary from the certified copy endpoint', async () => {
    postMock.mockResolvedValue({
      data: new Uint8Array([37, 80, 68, 70]).buffer,
      headers: {
        'content-disposition':
          "attachment; filename=FlashID-Certified-Copy.pdf; filename*=UTF-8''FlashID-Certified-Copy.pdf",
      },
    })
    await certifiedCopyService.generate('c-1')
    expect(postMock).toHaveBeenCalledWith(
      '/api/certified-copies/credentials/c-1',
      undefined,
      {
        headers: { Accept: 'application/pdf' },
        responseType: 'arraybuffer',
      }
    )
  })

  it('Should return the pdf bytes and the server file name', async () => {
    postMock.mockResolvedValue({
      data: new Uint8Array([37, 80, 68, 70]).buffer,
      headers: { 'content-disposition': 'attachment; filename="copy-1.pdf"' },
    })
    const result = await certifiedCopyService.generate('c-1')
    expect(Array.from(result.bytes)).toEqual([37, 80, 68, 70])
    expect(result.fileName).toBe('copy-1.pdf')
  })

  it('Should fall back to a default file name without a disposition header', async () => {
    postMock.mockResolvedValue({ data: new ArrayBuffer(0), headers: {} })
    const result = await certifiedCopyService.generate('c-1')
    expect(result.fileName).toBe('certified-copy.pdf')
    expect(result.bytes).toHaveLength(0)
  })

  it('Should propagate transport failures', async () => {
    postMock.mockRejectedValue(new Error('network down'))
    await expect(certifiedCopyService.generate('c-1')).rejects.toThrow(
      'network down'
    )
  })
})

describe('resolveCertifiedCopyError', () => {
  it.each([
    [404, 'We could not find that credential in your wallet.'],
    [403, 'We could not find that credential in your wallet.'],
    [
      400,
      'This credential is not active, so a certified copy cannot be issued.',
    ],
    [500, 'Could not create your certified copy. Please try again.'],
  ])('Should map status %s to its message', (status, expected) => {
    expect(resolveCertifiedCopyError(axiosErrorWith(status as number))).toBe(
      expected
    )
  })

  it('Should report a connection problem when there is no response', () => {
    expect(resolveCertifiedCopyError(axiosErrorWith(undefined))).toBe(
      'Could not reach the server. Check your connection.'
    )
  })

  it('Should fall back for non-axios errors', () => {
    expect(resolveCertifiedCopyError(new Error('boom'))).toBe(
      'Could not create your certified copy. Please try again.'
    )
  })
})
