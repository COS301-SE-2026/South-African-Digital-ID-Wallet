import { render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'

import type { IdentityRecord } from '@/types'

import { OnboardingStatusCard } from '../onboarding-status-card'

const RECORD: IdentityRecord = {
  dateOfBirth: '1990-01-01',
  fullName: 'Thabo Mokoena',
  saId: '9001015800086',
  status: 'Verified',
}

const renderCard = (
  props: Partial<ComponentProps<typeof OnboardingStatusCard>> = {}
) =>
  render(
    <OnboardingStatusCard
      accountCreated={false}
      activationSent={false}
      idConsent={false}
      record={null}
      {...props}
    />
  )

describe('OnboardingStatusCard', () => {
  it('Should render every onboarding step', () => {
    renderCard()
    expect(screen.getByText('Identity record retrieved')).toBeInTheDocument()
    expect(screen.getByText('Consent captured')).toBeInTheDocument()
    expect(screen.getByText('Contact details captured')).toBeInTheDocument()
    expect(screen.getByText('Pending account created')).toBeInTheDocument()
    expect(screen.getByText('Activation link sent')).toBeInTheDocument()
  })
  it('Should mark nothing as done before anything has happened', () => {
    renderCard()
    expect(screen.getByText('Identity record retrieved')).not.toHaveClass(
      'font-semibold'
    )
    expect(screen.getByText('Contact details captured')).not.toHaveClass(
      'font-semibold'
    )
  })
  it('Should mark the identity step done once a record is retrieved', () => {
    renderCard({ record: RECORD })
    expect(screen.getByText('Identity record retrieved')).toHaveClass(
      'font-semibold'
    )
    expect(screen.getByText('Pending account created')).not.toHaveClass(
      'font-semibold'
    )
  })
  it('Should mark consent and contact details done one the account is created', () => {
    renderCard({ accountCreated: true, idConsent: true, record: RECORD })
    expect(screen.getByText('Consent captured')).toHaveClass('font-semibold')
    expect(screen.getByText('Contact details captured')).toHaveClass(
      'font-semibold'
    )
    expect(screen.getByText('Pending account created')).toHaveClass(
      'font-semibold'
    )
  })
  it('Should leave consent incomplete when ID consent was never given', () => {
    renderCard({ accountCreated: true, idConsent: false, record: RECORD })
    expect(screen.getByText('Consent captured')).not.toHaveClass(
      'font-semibold'
    )
  })
})
