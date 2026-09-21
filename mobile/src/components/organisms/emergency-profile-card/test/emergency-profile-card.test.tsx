import { render, screen } from '@testing-library/react-native'

import { EmergencyProfileCard } from '../emergency-profile-card'

const PROFILE = {
  accessedAt: '2026-09-21T10:00:00Z',
  contacts: [
    {
      email: 'sipho@example.com',
      name: 'Sipho Dlamini',
      phone: '0821234567',
      relationship: 'Brother',
    },
  ],
  identity: {
    dateOfBirth: '1990-04-12T00:00:00Z',
    names: 'Thandiwe',
    photoUrl: null,
    surname: 'Dlamini',
  },
  medical: [
    { key: 'bloodType' as const, label: 'Blood type', value: 'O negative' },
    { key: 'allergies' as const, label: 'Allergies', value: 'Penicillin' },
  ],
  medicalLastUpdatedAt: '2026-01-15',
}

describe('<EmergencyProfileCard/>', () => {
  it('Should render the identity', async () => {
    await render(<EmergencyProfileCard profile={PROFILE} />)
    expect(screen.getByText('Thandiwe Dlamini')).toBeTruthy()
    expect(screen.getByText('Born 1990-04-12')).toBeTruthy()
  })

  it('Should render each medical field', async () => {
    await render(<EmergencyProfileCard profile={PROFILE} />)
    expect(screen.getByText('O negative')).toBeTruthy()
    expect(screen.getByText('Penicillin')).toBeTruthy()
  })

  it('Should mark the data as self-reported', async () => {
    await render(<EmergencyProfileCard profile={PROFILE} />)
    expect(screen.getByText(/Self-reported by the citizen/)).toBeTruthy()
  })

  it('Should say when the update date is unknown', async () => {
    await render(
      <EmergencyProfileCard
        profile={{ ...PROFILE, medicalLastUpdatedAt: null }}
      />
    )
    expect(screen.getByText(/Date not recorded/)).toBeTruthy()
  })

  it('Should render contacts with a phone number', async () => {
    await render(<EmergencyProfileCard profile={PROFILE} />)
    expect(screen.getByText('Sipho Dlamini · Brother')).toBeTruthy()
    expect(screen.getByText('0821234567')).toBeTruthy()
  })

  it('Should handle an empty profile', async () => {
    await render(
      <EmergencyProfileCard
        profile={{ ...PROFILE, contacts: [], medical: [] }}
      />
    )
    expect(
      screen.getByText('The citizen released no medical fields.')
    ).toBeTruthy()
    expect(screen.getByText('No contacts listed.')).toBeTruthy()
  })

  it('Should always show the emergency numbers', async () => {
    await render(<EmergencyProfileCard profile={PROFILE} />)
    expect(screen.getByText(/10177/)).toBeTruthy()
  })
})
