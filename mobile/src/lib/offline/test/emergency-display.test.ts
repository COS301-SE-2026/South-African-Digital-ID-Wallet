import { toOfflineEmergencyProfile } from '../emergency-display'

const AT = new Date('2026-09-27T10:00:00Z')

describe('toOfflineEmergencyProfile', () => {
  it('Should label medical claims like the online card', () => {
    const profile = toOfflineEmergencyProfile(
      {
        full_name: 'Thandiwe Dlamini',
        blood_type: 'O negative',
        medical_updated_on: '2026-09-01',
      },
      AT
    )

    expect(profile.identity.names).toBe('Thandiwe Dlamini')
    expect(profile.medical).toEqual([
      { key: 'blood_type', label: 'Blood type', value: 'O negative' },
    ])
    expect(profile.medicalLastUpdatedAt).toBe('2026-09-01')
    expect(profile.accessedAt).toBe(AT.toISOString())
  })

  it('Should rebuild released contacts in order and keep them out of the medical list', () => {
    const profile = toOfflineEmergencyProfile(
      {
        contact_1_name: 'Lerato Dlamini',
        contact_1_relationship: 'Mother',
        contact_2_name: 'Sipho Dlamini',
        contact_2_phone: '0821234567',
        contact_2_relationship: 'Brother',
        medical_updated_on: '2026-09-01',
      },
      AT
    )

    expect(profile.contacts).toEqual([
      {
        name: 'Lerato Dlamini',
        phone: null,
        priority: 1,
        relationship: 'Mother',
      },
      {
        name: 'Sipho Dlamini',
        phone: '0821234567',
        priority: 2,
        relationship: 'Brother',
      },
    ])
    expect(profile.medical).toEqual([])
  })

  it('Should carry no date of birth, photo or contacts unless released', () => {
    const profile = toOfflineEmergencyProfile(
      { medical_updated_on: '2026-09-01' },
      AT
    )

    expect(profile.identity.dateOfBirth).toBe('')
    expect(profile.identity.photoUrl).toBeNull()
    expect(profile.contacts).toEqual([])
  })

  it('Should say when the citizen did not release their name', () => {
    const profile = toOfflineEmergencyProfile(
      { medical_updated_on: '2026-09-01' },
      AT
    )

    expect(profile.identity.names).toBe('Name not released for offline use')
  })
})
