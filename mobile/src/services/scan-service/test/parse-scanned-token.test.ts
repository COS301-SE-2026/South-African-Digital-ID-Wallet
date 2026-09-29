import { parseScannedToken } from '../parse-scanned-token'

const encode = (value: string) => Buffer.from(value, 'utf8').toString('base64')
const envelopeFor = (type: string) =>
  encode(
    JSON.stringify({
      payload: encode(JSON.stringify({ type })),
      signature: 'sig',
    })
  )

describe('parseScannedToken', () => {
  it.each(['disclosure', 'badge'])('Should accept a %s payload', (type) => {
    const raw = envelopeFor(type)
    expect(parseScannedToken(raw)).toEqual({ token: raw, type })
  })

  it('Should reject an unknown payload type', () => {
    expect(parseScannedToken(envelopeFor('nonsense'))).toBeNull()
  })

  it('Should reject an envelope with no signature', () => {
    const raw = encode(
      JSON.stringify({ payload: encode(JSON.stringify({ type: 'badge' })) })
    )
    expect(parseScannedToken(raw)).toBeNull()
  })

  it('Should reject text that is not base64 json', () => {
    expect(parseScannedToken('just-a-plain-string')).toBeNull()
  })
})
