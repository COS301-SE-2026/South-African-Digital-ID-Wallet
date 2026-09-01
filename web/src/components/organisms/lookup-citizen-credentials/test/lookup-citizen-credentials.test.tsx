import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { LookupCitizenCredentials } from '../lookup-citizen-credentials'
import type { LookupCitizenCredentialsProps } from '../types'

const push = jest.fn()
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

const baseProps: LookupCitizenCredentialsProps = {
  citizen: null,
  errors: {},
  isPending: false,
  notFound: false,
  onLookup: () => {},
  saId: '',
  setErrors: () => {},
  setSaId: () => {},
}

describe('LookupCitizenCredentials', () => {
  beforeEach(() => {
    push.mockClear()
  })

  it('renders the SA ID field', () => {
    render(<LookupCitizenCredentials {...baseProps} />)

    expect(screen.getByLabelText(/citizen sa id number/i)).toBeInTheDocument()
  })

  it('calls onLookup when the button is clicked', async () => {
    const onLookup = jest.fn()
    render(
      <LookupCitizenCredentials
        {...baseProps}
        onLookup={onLookup}
        saId="9405225800083"
      />
    )

    await userEvent.click(
      screen.getByRole('button', { name: /look up citizen/i })
    )

    expect(onLookup).toHaveBeenCalledTimes(1)
  })

  it('renders citizen details and existing credentials', () => {
    render(
      <LookupCitizenCredentials
        {...baseProps}
        citizen={{
          activatedAt: '2026-03-11',
          dateOfBirth: '1994-05-22',
          email: 'thandi@example.com',
          existingCredentials: [
            {
              issueDate: '2026-03-12',
              status: 'Active',
              type: 'IdentityDocument',
            },
          ],
          names: 'Thandi',
          phoneNumber: '+27612345678',
          saId: '9405225800083',
          status: 'Activated',
          surname: 'Mokoena',
        }}
      />
    )

    expect(screen.getByText(/thandi mokoena/i)).toBeInTheDocument()
    expect(screen.getByText('Activated')).toBeInTheDocument()
    expect(screen.getByText('9405225800083')).toBeInTheDocument()
    expect(
      screen.getByText(/south african identity document/i)
    ).toBeInTheDocument()
  })

  it('offers onboarding when no record exists', async () => {
    render(<LookupCitizenCredentials {...baseProps} notFound />)

    await userEvent.click(
      screen.getByRole('button', { name: /route to onboarding/i })
    )

    expect(push).toHaveBeenCalledWith('/officials/onboard-citizen')
  })
})
