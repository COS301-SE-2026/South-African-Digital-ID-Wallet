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

  it('Should never carry a date of birth, photo or contacts offline', () => {
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
