import { parseScannedToken } from '../parse-scanned-token'

describe('parseScannedToken — emergency formats', () => {
  it('Should recognise a live emergency code', () => {
    const raw = 'https://flashid.co.za/e#1.aGFuZGxl.dHM.c2ln'
    expect(parseScannedToken(raw)).toEqual({ token: raw, type: 'emergency' })
  })

  it('Should no longer recognise the retired FIDE1 offline format', () => {
    expect(parseScannedToken('FIDE1/0/3/chunkdata')).toBeNull()
  })

  it('Should not treat a lookalike URL as an emergency code', () => {
    expect(parseScannedToken('https://flashid.co.za/emergency')).toBeNull()
  })

  it('Should still reject plain rubbish', () => {
    expect(parseScannedToken('hello world')).toBeNull()
  })
})
