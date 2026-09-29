import { AxiosError, type AxiosResponse } from 'axios'

import api from '@/lib/api'
import qrService from '../qr-service'
import { resolveQrError } from '../qr-errors'
import { toQrCredentialType } from '../qr-field-definitions'

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

describe('qrService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('Should post the disclosed fields to the credential qr endpoint', async () => {
    postMock.mockResolvedValue({
      data: { expiresAt: '2026-01-01T00:01:00Z', token: 'qr-1' },
    })
    await expect(qrService.generate('c-1', ['Photo'])).resolves.toEqual({
      expiresAt: '2026-01-01T00:01:00Z',
      token: 'qr-1',
    })
    expect(postMock).toHaveBeenCalledWith('/api/credentials/c-1/qr-token', {
      disclosedFields: ['Photo'],
    })
  })

  it('Should propagate transport failures', async () => {
    postMock.mockRejectedValue(new Error('network down'))
    await expect(qrService.generate('c-1', [])).rejects.toThrow('network down')
  })
})

describe('resolveQrError', () => {
  it.each([
    [404, 'We could not find that credential in your wallet.'],
    [403, 'We could not find that credential in your wallet.'],
    [400, 'This credential is not active, so it cannot be shared.'],
  ])('Should map status %s to its message', (status, expected) => {
    expect(resolveQrError(axiosErrorWith(status as number))).toBe(expected)
  })

  it('Should report a connection problem when there is no response', () => {
    expect(resolveQrError(axiosErrorWith(undefined))).toBe(
      'Could not reach the server. Check your connection.'
    )
  })

  it('Should fall back for non-axios errors', () => {
    expect(resolveQrError(new Error('boom'))).toBe(
      'Could not generate your QR code. Please try again.'
    )
  })
})

describe('toQrCredentialType', () => {
  it.each([
    ['driversLicense', 'driversLicense'],
    ['DRIVERSLICENSE', 'driversLicense'],
    ['  driverslicense  ', 'driversLicense'],
    ['IdentityDocument', 'identityDocument'],
    [undefined, 'identityDocument'],
  ])('Should map %s to %s', (input, expected) => {
    expect(toQrCredentialType(input as string | undefined)).toBe(expected)
  })
})
