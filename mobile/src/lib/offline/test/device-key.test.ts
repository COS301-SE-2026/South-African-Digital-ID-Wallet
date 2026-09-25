import { p256 } from '@noble/curves/nist.js'
import { base64urlnopad } from '@scure/base'
import * as Crypto from 'expo-crypto'
import * as SecureStore from 'expo-secure-store'

import { getDevicePublicJwk, loadDeviceSigner } from '../device-key'

const mockSecureStore = new Map<string, string>()

jest.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'whenUnlockedThisDeviceOnly',
  getItemAsync: jest.fn(
    async (key: string) => mockSecureStore.get(key) ?? null
  ),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockSecureStore.set(key, value)
  }),
}))

jest.mock('expo-crypto', () => ({ getRandomBytes: jest.fn() }))

const randomBytesMock = Crypto.getRandomBytes as jest.Mock
const setItemMock = SecureStore.setItemAsync as jest.Mock

const pointOf = (jwk: { x: string; y: string }) =>
  new Uint8Array([
    4,
    ...base64urlnopad.decode(jwk.x),
    ...base64urlnopad.decode(jwk.y),
  ])

describe('device key', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSecureStore.clear()
    randomBytesMock.mockImplementation((length: number) =>
      Uint8Array.from({ length }, (_, index) => (index * 13 + 7) % 251)
    )
  })

  it('Should publish an EC P-256 key with 32-byte coordinates', async () => {
    const jwk = await getDevicePublicJwk()

    expect(jwk.kty).toBe('EC')
    expect(jwk.crv).toBe('P-256')
    expect(base64urlnopad.decode(jwk.x)).toHaveLength(32)
    expect(base64urlnopad.decode(jwk.y)).toHaveLength(32)
  })

  it('Should keep the key in secure storage for this device only', async () => {
    await getDevicePublicJwk()

    expect(setItemMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      { keychainAccessible: 'whenUnlockedThisDeviceOnly' }
    )
  })

  it('Should return the same key on every call', async () => {
    const first = await getDevicePublicJwk()
    const second = await getDevicePublicJwk()

    expect(second).toEqual(first)
    expect(setItemMock).toHaveBeenCalledTimes(1)
  })

  it('Should create only one key when two callers ask at the same time', async () => {
    const [first, second] = await Promise.all([
      getDevicePublicJwk(),
      getDevicePublicJwk(),
    ])

    expect(second).toEqual(first)
    expect(setItemMock).toHaveBeenCalledTimes(1)
  })

  it('Should draw new random bytes when the first ones are not a valid key', async () => {
    randomBytesMock.mockReturnValueOnce(new Uint8Array(32))

    await getDevicePublicJwk()

    expect(randomBytesMock).toHaveBeenCalledTimes(2)
  })

  it('Should sign messages that verify against the published key', async () => {
    const jwk = await getDevicePublicJwk()
    const sign = await loadDeviceSigner()
    const message = new TextEncoder().encode('header.payload')

    const signature = sign(message)

    expect(signature).toHaveLength(64)
    expect(
      p256.verify(signature, message, pointOf(jwk), {
        prehash: true,
        lowS: false,
      })
    ).toBe(true)
  })

  it('Should sign deterministically so no runtime randomness is needed', async () => {
    const sign = await loadDeviceSigner()
    const message = new TextEncoder().encode('header.payload')

    expect(sign(message)).toEqual(sign(message))
  })
})
