import type { CitizenCredentialStatus, IssuedCredential } from '@/types'

import {
  citizenCredentialStatusModel,
  issuedCredentialModel,
} from '../issue-credential-model'

describe('citizenCredentialStatusModel', () => {
  it('Should trim the timestamps to dates and defaults missing credentials', () => {
    const citizen = citizenCredentialStatusModel({
      activatedAt: '2026-03-11T08:15:00Z',
      dateOfBirth: '1994-05-22T00:00:00Z',
      email: null,
      names: 'Thandi',
      phoneNumber: null,
      saId: '9405225800083',
      status: 'Activated',
      surname: 'Mokoena',
    } as CitizenCredentialStatus)

    expect(citizen.dateOfBirth).toBe('1994-05-22')
    expect(citizen.activatedAt).toBe('2026-03-11')
    expect(citizen.existingCredentials).toEqual([])
  })
  it('Should trim the issue date on each exisiting credential', () => {
    const citizen = citizenCredentialStatusModel({
      activatedAt: null,
      dateOfBirth: '1994-05-22T00:00:00Z',
      email: null,
      existingCredentials: [
        {
          issueDate: '2026-03-12T09:00:00Z',
          status: 'Active',
          type: 'IdentityDocument',
        },
      ],
      names: 'Thandi',
      phoneNumber: null,
      saId: '9405225800083',
      status: 'Activated',
      surname: 'Mokoena',
    } as CitizenCredentialStatus)
    expect(citizen.existingCredentials[0].issueDate).toBe('2026-03-12')
  })
})

describe('issuedCredentialModel', () => {
  it('Should leave driversLicense undefined when absent', () => {
    const issued = issuedCredentialModel({
      id: 'cred-1',
      issueDate: '2026-08-22T10:00:00Z',
      issuedBy: 'Licensing Department',
      status: 'Active',
      title: 'South African Identity Document',
      type: 'IdentityDocument',
    } as IssuedCredential)
    expect(issued.issueDate).toBe('2026-08-22')
    expect(issued.driversLicense).toBeUndefined()
  })
  it('Should trim the licence expiry date when present', () => {
    const issued = issuedCredentialModel({
      driversLicense: {
        expiryDate: '2031-08-22T00:00:00Z',
        licenseCode: 'EB',
        licenseNumber: 'DL-940522',
        restrictions: 'Corrective lenses',
      },
      id: 'cred-2',
      issueDate: '2026-08-22T10:00:00Z',
      issuedBy: 'Licensing Department',
      status: 'Active',
      title: "Driver's Licence",
      type: 'DriversLicense',
    } as IssuedCredential)
    expect(issued.driversLicense?.expiryDate).toBe('2031-08-22')
  })
})
