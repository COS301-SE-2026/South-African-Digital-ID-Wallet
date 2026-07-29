import qrUrls from '../qr-urls'
import { MANDATORY_FIELDS, OPTIONAL_FIELDS } from '../qr-field-definitions'

describe('qrUrls', () => {
  it('generate url contains credential id and correct path', () => {
    const url = qrUrls.generate('credential-123')
    expect(url).toContain('credential-123')
    expect(url).toContain('/qr-token')
  })

  it('mine url contains correct path', () => {
    expect(qrUrls.mine()).toContain('/api/credentials/mine')
  })
})

describe('MANDATORY_FIELDS', () => {
  it('includes all required identity document fields', () => {
    expect(MANDATORY_FIELDS.identityDocument).toEqual([
      'Date of birth',
      'Photograph',
    ])
  })

  it('includes all required drivers license fields', () => {
    expect(MANDATORY_FIELDS.driversLicense).toEqual([
      'Photo',
      'Expiry date',
      'Date of birth',
    ])
  })
})

describe('OPTIONAL_FIELDS', () => {
  it('includes optional identity document fields', () => {
    expect(OPTIONAL_FIELDS.identityDocument).toEqual([
      'Identity number',
      'Full surname',
      'Full forenames',
      'Citizenship status',
      'Gender',
      'Country of birth',
      'Signature',
      'Card issue date and number',
    ])
  })

  it('includes optional drivers license fields', () => {
    expect(OPTIONAL_FIELDS.driversLicense).toEqual([
      'Full name',
      'SA ID number',
      'License number',
      'License code',
      'Country of issue',
      'Signature',
      'Vehicle restrictions',
      'Date of issue',
    ])
  })
})
