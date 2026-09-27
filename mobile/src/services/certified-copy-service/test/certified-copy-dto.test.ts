import {
  CERTIFIED_COPY_FALLBACK_FILE_NAME,
  toCertifiedCopyFileName,
} from '../certified-copy-dto'

describe('toCertifiedCopyFileName', () => {
  it('Should prefer the encoded file name', () => {
    expect(
      toCertifiedCopyFileName(
        "attachment; filename=plain.pdf; filename*=UTF-8''Thabo%20Mokoena%20ID.pdf"
      )
    ).toBe('Thabo-Mokoena-ID.pdf')
  })
  it('Should read a quoted plain file name', () => {
    expect(toCertifiedCopyFileName('attachment; filename="copy.pdf"')).toBe(
      'copy.pdf'
    )
  })
  it('Should read an unquoted plain file name', () => {
    expect(toCertifiedCopyFileName('attachment; filename=copy.pdf')).toBe(
      'copy.pdf'
    )
  })
  it('Should sanitise a malformed encoded name without throwing', () => {
    expect(
      toCertifiedCopyFileName("attachment; filename*=UTF-8''bad%E0.pdf")
    ).toBe('bad-E0.pdf')
  })
  it('Should add the pdf extension when missing', () => {
    expect(toCertifiedCopyFileName('attachment; filename=copy')).toBe(
      'copy.pdf'
    )
  })
  it('Should strip path traversal characters', () => {
    expect(
      toCertifiedCopyFileName('attachment; filename="../../etc.pdf"')
    ).toBe('etc.pdf')
  })
  it.each([undefined, null, '', 'attachment', 'attachment; filename=""'])(
    'Should fall back for %p',
    (value) => {
      expect(toCertifiedCopyFileName(value)).toBe(
        CERTIFIED_COPY_FALLBACK_FILE_NAME
      )
    }
  )
})
