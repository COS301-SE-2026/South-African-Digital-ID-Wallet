import { parseScannedToken } from '../parse-scanned-token'

function encodeEnvelope(payloadObject: object): string {
  const payloadJson = JSON.stringify(payloadObject)
  const payloadBase64 = btoa(payloadJson)
  const envelope = {
    payload: payloadBase64,
    signature: 'fake-signature',
  }
  return btoa(JSON.stringify(envelope))
}

describe('parseScannedToken', () => {
  it('classifies a disclosure token', () => {
    const token = encodeEnvelope({
      type: 'disclosure',
      credential: 'abc',
    })
    expect(parseScannedToken(token)).toEqual({
      type: 'disclosure',
      token,
    })
  })

  it('classifies a badge token', () => {
    const token = encodeEnvelope({ type: 'badge', officialId: '123' })
    expect(parseScannedToken(token)).toEqual({ type: 'badge', token })
  })

  it('returns null for an unrecognised type value', () => {
    const token = encodeEnvelope({ type: 'something-else' })
    expect(parseScannedToken(token)).toBeNull()
  })

  it('returns null for malformed base64', () => {
    expect(parseScannedToken('not-a-valid-base64!')).toBeNull()
  })

  it('returns null for a scanned code that is valid base64/JSON but not our envelope shape', () => {
    const token = btoa(JSON.stringify({ url: 'https://exameple.example' }))
    expect(parseScannedToken(token)).toBeNull()
  })

  it('returns null when payload/signature fields are missing', () => {
    const token = btoa(JSON.stringify({ somethingElse: true }))
    expect(parseScannedToken(token)).toBeNull()
  })
})
