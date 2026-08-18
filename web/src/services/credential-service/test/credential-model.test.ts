import { IdCard, Car } from 'lucide-react'
import { toCredentialView } from '../credential-model'
import type { CredentialResponse } from '../types'

const idCredential: CredentialResponse = {
  id: 'id-1',
  type: 'IdentityDocument',
  title: 'National ID Card',
  issuedBy: 'Department of Home Affairs',
  status: 'Active',
  issueDate: '2024-02-12T00:00:00Z',
  identityDocument: {
    idNumber: '0001010001088',
    nationality: 'South African',
    citizenship: 'South African',
    countryOfBirth: 'South Africa',
    status: 'Citizen',
  },
  driversLicense: null,
}

const licenceCredential: CredentialResponse = {
  id: 'dl-1',
  type: 'DriversLicense',
  title: "Driver's Licence",
  issuedBy: 'Road Traffic Management',
  status: 'Active',
  issueDate: '2024-02-12T00:00:00Z',
  identityDocument: null,
  driversLicense: {
    licenseNumber: 'DL12345',
    licenseCode: 'B',
    restrictions: '',
    expiryDate: '2029-02-12T00:00:00Z',
  },
}

const val = (
  view: ReturnType<typeof toCredentialView>,
  label: string
): string | undefined => view.rows.find((r) => r.label === label)?.value

describe('toCredentialView for identity docs', () => {
  const view = toCredentialView(idCredential)

  it('it should map title and icon to correct variables', () => {
    expect(view.title).toBe('National ID Card')
    expect(view.icon).toBe(IdCard)
    expect(view.qrCredentialType).toBe('identityDocument')
  })

  it('show the identity doc detail rows', () => {
    expect(val(view, 'ID number')).toBe('0001010001088')
    expect(val(view, 'Nationality')).toBe('South African')
    expect(val(view, 'Citizenship')).toBe('South African')
    expect(val(view, 'Country of birth')).toBe('South Africa')
    expect(val(view, 'Status')).toBe('Citizen')
  })

  it('show issuer and the issue date formate as en-ZA', () => {
    expect(val(view, 'Issued by')).toBe('Department of Home Affairs')
    const issued = val(view, 'Issue date') ?? ''
    expect(issued).toContain('Feb')
    expect(issued).toContain('2024')
  })
})

describe('toCredentialView for drivers licence', () => {
  const view = toCredentialView(licenceCredential)

  it('it should map title and the icon correctly', () => {
    expect(view.title).toBe("Driver's Licence")
    expect(view.icon).toBe(Car)
    expect(view.qrCredentialType).toBe('driversLicense')
  })

  it('show the licence detail rows', () => {
    expect(val(view, 'License number')).toBe('DL12345')
    expect(val(view, 'Code')).toBe('B')
    expect(val(view, 'Expiry date')).toContain('2029')
  })

  it('empty restrictions as none', () => {
    expect(val(view, 'Restrictions')).toBe('None')
  })
})

describe('toCredentialView for status mapping', () => {
  it('make sure it maps Active to Verified', () => {
    const view = toCredentialView({ ...idCredential, status: 'Active' })
    expect(view.statusLabel).toBe('Verified')
    expect(view.statusIntent).toBe('active')
  })

  it.each(['Revoked', 'Investigation', 'Expired', 'Inactive'] as const)(
    'map %s to an inactive pill with its own label',
    (status) => {
      const view = toCredentialView({ ...idCredential, status })
      expect(view.statusLabel).toBe(status)
      expect(view.statusIntent).toBe('inactive')
    }
  )
})
