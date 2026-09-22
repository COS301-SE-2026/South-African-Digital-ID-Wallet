import { parseScannedToken } from '../parse-scanned-token'

describe('parseScannedToken — emergency formats', () => {
  it('Should recognise a live emergency code', () => {
    const raw = 'https://flashid.co.za/e#1.aGFuZGxl.dHM.c2ln'
    expect(parseScannedToken(raw)).toEqual({ token: raw, type: 'emergency' })
  })

  it('Should recognise an offline frame', () => {
    const raw = 'FIDE1/0/3/chunkdata'
    expect(parseScannedToken(raw)).toEqual({
      frame: raw,
      type: 'emergency-offline',
    })
  })

  it('Should not treat a lookalike URL as an emergency code', () => {
    expect(parseScannedToken('https://flashid.co.za/emergency')).toBeNull()
  })

  it('Should not treat a lookalike prefix as an offline frame', () => {
    expect(parseScannedToken('FIDE2/0/3/chunk')).toBeNull()
  })

  it('Should still reject plain rubbish', () => {
    expect(parseScannedToken('hello world')).toBeNull()
  })
})
