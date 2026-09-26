import { p256 } from '@noble/curves/nist.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { base64urlnopad } from '@scure/base'

import { createKeyBindingJwt, requiresKeyBinding } from '../key-binding'

const utf8 = (value: string) => new TextEncoder().encode(value)
const decodeSegment = (segment: string) =>
  JSON.parse(new TextDecoder().decode(base64urlnopad.decode(segment)))

const SD_JWT = 'issuer.jwt.signature~disclosure-one~'
const ISSUED_AT = 1_790_000_000
const deviceKey = p256.utils.randomSecretKey()
const sign = (message: Uint8Array) =>
  p256.sign(message, deviceKey, { prehash: true })

describe('createKeyBindingJwt', () => {
  it('Should use an ES256 kb+jwt header', () => {
    const [header] = createKeyBindingJwt(SD_JWT, sign, ISSUED_AT).split('.')

    expect(decodeSegment(header)).toEqual({ alg: 'ES256', typ: 'kb+jwt' })
  })

  it('Should carry iat and the sd_hash of the whole SD-JWT including its final tilde', () => {
    const [, payload] = createKeyBindingJwt(SD_JWT, sign, ISSUED_AT).split('.')

    expect(decodeSegment(payload)).toEqual({
      iat: ISSUED_AT,
      sd_hash: base64urlnopad.encode(sha256(utf8(SD_JWT))),
    })
  })

  it('Should be signed by the device key', () => {
    const [header, payload, signature] = createKeyBindingJwt(
      SD_JWT,
      sign,
      ISSUED_AT
    ).split('.')

    expect(
      p256.verify(
        base64urlnopad.decode(signature),
        utf8(`${header}.${payload}`),
        p256.getPublicKey(deviceKey, false),
        { prehash: true, lowS: false }
      )
    ).toBe(true)
  })

  it('Should give a different sd_hash when a disclosure is added', () => {
    const payloadOf = (sdJwt: string) =>
      decodeSegment(createKeyBindingJwt(sdJwt, sign, ISSUED_AT).split('.')[1])

    expect(payloadOf(`${SD_JWT}extra~`).sd_hash).not.toBe(
      payloadOf(SD_JWT).sd_hash
    )
  })
})

describe('requiresKeyBinding', () => {
  const sdJwtWith = (payload: unknown) =>
    `${base64urlnopad.encode(utf8('{}'))}.${base64urlnopad.encode(utf8(JSON.stringify(payload)))}.sig~d~`

  it('Should be true for a credential bound to a device key', () => {
    expect(requiresKeyBinding(sdJwtWith({ cnf: { jwk: {} } }))).toBe(true)
  })

  it('Should be false for a credential without cnf', () => {
    expect(requiresKeyBinding(sdJwtWith({ vct: 'x' }))).toBe(false)
  })

  it('Should be false for something it cannot read', () => {
    expect(requiresKeyBinding('not-a-credential')).toBe(false)
  })
})
