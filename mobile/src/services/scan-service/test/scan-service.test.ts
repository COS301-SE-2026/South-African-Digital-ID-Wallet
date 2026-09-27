import { AxiosError, type AxiosResponse } from 'axios'

import api from '@/lib/api'

import scanService from '../scan-service'
import scanUrls from '../scan-urls'
import { resolveScanError } from '../scan-errors'

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { post: jest.fn() },
  setAuthToken: jest.fn(),
  setDeviceToken: jest.fn(),
}))

const postMock = api.post as jest.Mock

const axiosErrorWith = (status: number | undefined) =>
  new AxiosError(
    'failed',
    'ERR_BAD_REQUEST',
    undefined,
    undefined,
    status === undefined ? undefined : ({ status, data: {} } as AxiosResponse)
  )

describe('scanUrls', () => {
  it('Should expose the resolve endpoint', () => {
    expect(scanUrls.resolve()).toBe('/api/credentials/resolve')
  })
})

describe('scanService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should POST the token and unwrap the disclosed fields', async () => {
    const response = {
      credentialType: 'Identity Document',
      disclosedFields: { Gender: 'F' },
    }
    postMock.mockResolvedValue({ data: response })
    await expect(scanService.resolveCredential('tok-1')).resolves.toEqual(
      response
    )
    expect(postMock).toHaveBeenCalledWith('/api/credentials/resolve', {
      token: 'tok-1',
    })
  })
  it('Should propagate transport failures', async () => {
    postMock.mockRejectedValue(new Error('network down'))
    await expect(scanService.resolveCredential('tok-1')).rejects.toThrow(
      'network down'
    )
  })
})

describe('resolveScanError', () => {
  it('Should explain a rejected code on 400', () => {
    expect(resolveScanError(axiosErrorWith(400))).toBe(
      'This QR code is invalid, expired, or has already been used.'
    )
  })
  it('Should report a connection problem when there is no response', () => {
    expect(resolveScanError(axiosErrorWith(undefined))).toBe(
      'Could not reach the server. Check your connection.'
    )
  })
  it('Should fall back for an unmapped status', () => {
    expect(resolveScanError(axiosErrorWith(500))).toBe(
      'Something went wrong. Please try again.'
    )
  })
  it('Should fall back for a non-axios error', () => {
    expect(resolveScanError(new Error('boom'))).toBe(
      'Something went wrong. Please try again.'
    )
  })
})
