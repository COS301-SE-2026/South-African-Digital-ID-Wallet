import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import toast from 'react-hot-toast'

import type { OnboardCitizenResponse } from '@/services'

import { OnboardSuccessPanel } from '../onboard-success-panel'

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn() },
}))

const RESPONSE: OnboardCitizenResponse = {
  activationExpiresAt: '2026-01-01T10:00:00.000Z',
  activationPin: '482913',
  citizenId: 'abc-123',
  saId: '9001015800086',
  status: 'Pending',
}

describe('OnboardingSuccessPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('Should render the onboarding response details', () => {
    render(<OnboardSuccessPanel response={RESPONSE} />)
    expect(
      screen.getByText('Citizen onboarded successfully')
    ).toBeInTheDocument()
    expect(screen.getByText('9001015800086')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('482913')).toBeInTheDocument()
    expect(
      screen.getByText(new Date(RESPONSE.activationExpiresAt).toLocaleString())
    ).toBeInTheDocument()
  })
  it('Should copy the activation PIN and confirm it', async () => {
    const writeText = jest.fn()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    render(<OnboardSuccessPanel response={RESPONSE} />)
    await userEvent.click(screen.getByRole('button', { name: 'Copy' }))
    expect(writeText).toHaveBeenCalledWith('482913')
    expect(toast.success).toHaveBeenCalledWith('Activation PIN copied')
  })
})
